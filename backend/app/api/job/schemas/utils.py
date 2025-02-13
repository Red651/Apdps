from datetime import date, datetime, time
import re
from app.core.schema_operations import BaseModel

def validate_time(v):
    if isinstance(v, str):
        v = v.rstrip('Z')

        datetime_match = re.match(r'(\d{4}-\d{2}-\d{2}T)?(\d{2}:\d{2}:\d{2})(?:\.(\d{1,6}))?', v)
        if datetime_match:
            _, time_part, microsecond = datetime_match.groups()
            hour, minute, second = time_part.split(':')
            microsecond = microsecond or '0'
            microsecond = microsecond.ljust(6, '0')[:6]
            
            return time(int(hour), int(minute), int(second), int(microsecond))

        match = re.match(r'(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?', v)
        if match:
            hour, minute, second, microsecond = match.groups()
            microsecond = microsecond or '0'
            microsecond = microsecond.ljust(6, '0')[:6]
            
            return time(int(hour), int(minute), int(second), int(microsecond))

    if isinstance(v, datetime):
        return v.time()

    if isinstance(v, time):
        return v
    
    raise ValueError(f'Invalid time: {v}')

def validate_date(v):
    if isinstance(v, str):
        v = v.rstrip('Z')

        datetime_match = re.match(r'(\d{4}-\d{2}-\d{2})(T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?)?', v)
        if datetime_match:
            date_part, _ = datetime_match.groups()
            return datetime.strptime(date_part, '%Y-%m-%d').date()

        match = re.match(r'(\d{4}-\d{2}-\d{2})|(\d{2}/\d{2}/\d{4})', v)
        if match:

            date_part = match.group(0)
            if '-' in date_part:
                return datetime.strptime(date_part, '%Y-%m-%d').date()
            else:
                return datetime.strptime(date_part, '%d/%m/%Y').date()

    if isinstance(v, datetime):
        return v.date()
    
    if isinstance(v, date):
        return v

    raise ValueError(f'Invalid date: {v}')


class EndTimeBeforeStartTime(Exception):...
