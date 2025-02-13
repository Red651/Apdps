from fastapi.exceptions import RequestValidationError
from pydantic import JsonValue, ValidationError
from typing import Any, Optional, Union, Type
from fastapi import HTTPException
from pydantic import BaseModel
import inspect

class BaseModel(BaseModel):
    
    class Config:
        from_attributes = True
        populate_by_name = True

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[Any] = None
    
def build_nested_model(model: BaseModel, data):
    result = {}
    
    for field, field_info in model.model_fields.items():
        
        field_type = field_info.annotation
        
        if isinstance(field_type, type) and issubclass(field_type, BaseModel):

            result[field] = build_nested_model(field_type, data)
        else:
            result[field] = data.get(field)
    
    return result



def create_api_response(success: bool, message: str, data: dict = None, status_code: int = 200):
    if not success:
        if status_code == 200:
            status_code = 500
        raise HTTPException(status_code=status_code, detail=message)
    
    output = {
        "success": success,
        "message": message,
    }
    
    if data:
        output["data"] = data
    
    return output

class PlotlyJSONSchema(BaseModel):
    data: JsonValue
    layout: JsonValue

def is_pydantic(obj: object):
    """Checks whether an object is pydantic."""
    return type(obj).__class__.__name__ == "ModelMetaclass"

def is_valid_key(cls, key):
    init_params = inspect.signature(cls.__init__).parameters
    return key in init_params or hasattr(cls, key)

def model_from_dict(model, data: dict, variables: dict = {}):
    """
    Updates the attributes of an SQLAlchemy model instance from a dictionary,
    ignoring keys that are not present in the data or are set to None.
    """
    data = {**data, **variables}
    new_data = {}
    for key, value in data.items():
        if is_valid_key(model, key):
            new_data[key] = value
    return model(**new_data)

def parse_schema(schema, variables: dict = {}):
    """
    Iterates through pydantic schema and parses nested schemas
    to a dictionary containing SQLAlchemy models.
    Only works if nested schemas have specified the Meta.orm_model.
    """
    
    parsed_schema = dict(schema)
    
    parsed_schema_copy = parsed_schema.copy()
    
    for key, value in parsed_schema_copy.items():

        try:
            if isinstance(value, list) and len(value) and is_pydantic(value[0]):
                child_parsed_schema = []
                for i, item in enumerate(value):
                    if hasattr(item.Meta, "index_column"):
                        child_variables = {**variables, item.Meta.index_column: i}
                    else:
                        child_variables = variables
                    child_dict = parse_schema(item, child_variables)
                    child_parsed_schema.append(model_from_dict(item.Meta.orm_model, child_dict, child_variables))
                parsed_schema[key] = child_parsed_schema
            elif is_pydantic(value):
                child_dict = parse_schema(value, variables)
                parsed_schema[key] = model_from_dict(
                    value.Meta.orm_model,
                    child_dict,
                    variables
                )
            elif value is None:
                del parsed_schema[key]
        except AttributeError as e:
            
            print(e)
            
            raise AttributeError(
                f"Found nested Pydantic model in {schema.__class__} {key} but Meta.orm_model was not specified."
            )
    return parsed_schema

def parse_validation_error(exc: Union[ValidationError, RequestValidationError]):
    
    error_list = []

    for error in exc.errors():
        
        error_location = error["loc"][-1]
        
        error_list.append(f'Error at {error_location if isinstance(error_location, str) else error["loc"][-2]}: {error["msg"]}, Your input was {error["input"]}')
    
    return error_list
        
def generate_custom_model(original_model: BaseModel, new_type: Type, model_name: str):
    # Dynamically create a dictionary for the new model annotations with the custom type
    annotations = {
        field: Optional[new_type] for field in original_model.__annotations__
    }
    
    # Create a new dictionary for fields with their original Field settings
    fields = {
        field: original_model.model_fields[field]
        for field in original_model.__annotations__
    }
    
    # Create the new Pydantic model dynamically with the custom model name, annotations, and fields
    return type(
        model_name,  # New model name as input
        (BaseModel,),  # Base class
        {
            "__annotations__": annotations,  # Set annotations to the new type
            **fields  # Copy the fields from the original model
        }
    )

# class AllRequired(ModelMetaclass):
#     def __new__(self, name, bases, namespaces, **kwargs):
#         annotations = namespaces.get('__annotations__', {})
#         print(annotations)
#         for base in bases:
#             annotations.update(base.__annotations__)
#         for field in annotations:
#             if not field.startswith('__'):
#                 if getattr(annotations[field], '_name', None) is "Optional":
#                     annotations[field] = get_args(annotations[field])[0]
#                 else:
#                     annotations[field] = annotations[field]
#         namespaces['__annotations__'] = annotations
#         return super().__new__(self, name, bases, namespaces, **kwargs)