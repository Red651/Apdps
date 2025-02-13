import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Grid,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  VStack,
  Flex,
  Text,
  Icon,
  FormErrorMessage,
  GridItem,
} from "@chakra-ui/react";
import { IconDropCircle } from "@tabler/icons-react";
import { useJobContext } from "../../../../Context/JobContext";
import { ADD_WELL_MASTER } from "../../../../Reducer/reducer";
import HeaderForm from "../../../Components/Form/LabelForm";


const WellLocation = ({ errorForms = {}, fieldRefs }) => {
  const { state, dispatch } = useJobContext();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [formData, setFormData] = useState({
    surface_longitude: "",
    surface_latitude: "",
    bottom_hole_longitude: "",
    bottom_hole_latitude: "",
  });


  useEffect(() => {
    if (fieldRefs) {
      // Hubungkan setiap input dengan fieldRefs
      fieldRefs.current.surface_longitude = document.querySelector('[name="surface_longitude"]');
      fieldRefs.current.surface_latitude = document.querySelector('[name="surface_latitude"]');
      fieldRefs.current.bottom_hole_longitude = document.querySelector('[name="bottom_hole_longitude"]');
      fieldRefs.current.bottom_hole_latitude = document.querySelector('[name="bottom_hole_latitude"]');
    }
  }, [fieldRefs]);


  const previousFormDataRef = useRef(formData);
  const debounceRef = useRef(null);


  useEffect(() => {
    if (isInitialLoad && state?.wellMaster) {
      const wellData = state.wellMaster;
      setFormData({
        surface_longitude: wellData.surface_longitude?.toString() || "",
        surface_latitude: wellData.surface_latitude?.toString() || "",
        bottom_hole_longitude: wellData.bottom_hole_longitude?.toString() || "",
        bottom_hole_latitude: wellData.bottom_hole_latitude?.toString() || "",
      });
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);


  const formatCoordinate = useCallback((value) => {
    // Jika input kosong, kembalikan string kosong
    if (!value) return '';
  
  
    // Debug: Log input asli
     
  
  
    // Konversi ke string dan hapus karakter non-numerik kecuali minus di awal
    let cleanValue = value.toString()
      .replace(/^(-?)/, '$1') // Simpan minus di awal jika ada
      .replace(/[^0-9]/g, ''); // Hapus semua karakter non-numerik
  
  
    // Debug: Log setelah pembersihan
     
  
  
    return cleanValue;
  }, []);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      
      // Format value
      const formattedValue = formatCoordinate(value);
      
      // Debug logging
       
       
  
  
      // Update state SEBELUM debounce
      setFormData(prev => {
        // Log previous state
         
        
        // Return new state
        return {
          ...prev,
          [name]: formattedValue
        };
      });
  
  
      // Debounce dispatch
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        // Gunakan state terbaru dengan fungsi callback
        setFormData(prevFormData => {
          const numericFormData = Object.entries(prevFormData).reduce(
            (acc, [key, value]) => {
              // Tambahkan console.log untuk setiap value
               
              
              // Gunakan parseFloat dengan base 10 untuk memastikan
              // Tambahkan penanganan khusus untuk memastikan seluruh string diproses
              acc[key] = value !== "" ? parseFloat(value.toString().replace(/[^0-9.-]/g, ''), 10) : null;
              
              // Tambahkan log untuk hasil parsing
               
              
              return acc;
            },
            {}
          );
  
  
          // Log complete numeric form data
           
  
  
          if (
            JSON.stringify(numericFormData) !==
            JSON.stringify(previousFormDataRef.current)
          ) {
            console.log('Dispatching payload:', {
              ...state.wellMaster,
              ...numericFormData,
            });
  
  
            dispatch({
              type: ADD_WELL_MASTER,
              payload: {
                ...state.wellMaster,
                ...numericFormData,
              },
            });
            previousFormDataRef.current = numericFormData;
          }
  
  
          // Kembalikan state sebelumnya
          return prevFormData;
        });
      }, 300);
    },
    [formatCoordinate, dispatch, state.wellMaster]
  );


  return (
    <Box borderWidth="1px" borderRadius="lg" p={6} mt={4} fontFamily={"Mulish"}>
      <VStack align="stretch" spacing={4}>
        <Flex alignItems="center">
          <Icon as={IconDropCircle} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              {"Well Location"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {"Enter well coordinates"}
            </Text>
          </Flex>
        </Flex>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            <FormControl isInvalid={!!errorForms["surface_longitude"]}>
              <HeaderForm
                title={"Surface Longitude"}
                desc={
                  "Angular distance in decimal degrees, east or west of the prime meridian of the geodetic datum. A negative value represents a west longitude"
                }
              />
              <InputGroup>
                <Input
                  name="surface_longitude"
                  placeholder="Surface longitude"
                  type="text"
                  value={formData.surface_longitude}
                  onChange={handleChange}
                />
                <InputRightAddon>°</InputRightAddon>
              </InputGroup>
              {errorForms["surface_longitude"] && (
                <FormErrorMessage>
                  Surface longitude is required
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>
          <GridItem>
            <FormControl isInvalid={!!errorForms["surface_latitude"]}>
              <HeaderForm
                title={"Surface Latitude"}
                desc={
                  "Angular distance in decimal degrees, north or south of the equator. A positive value represents a north latitude"
                }
              />
              <InputGroup>
                <Input
                  type="text"
                  name="surface_latitude"
                  placeholder="Surface latitude"
                  value={formData.surface_latitude}
                  onChange={handleChange}
                />
                <InputRightAddon>°</InputRightAddon>
              </InputGroup>
              {errorForms["surface_latitude"] && (
                <FormErrorMessage>
                  Surface latitude is required
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>
        </Grid>

        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            <FormControl isInvalid={!!errorForms["bottom_hole_longitude"]}>
              <HeaderForm
                title={"Bottom Hole Longitude"}
                desc={
                  "Longitude of bottom hole point projected to surface. For straight wells this would be exactly the same as surface longitude or null"
                }
              />
              <InputGroup>
                <Input
                  name="bottom_hole_longitude"
                  placeholder="Bottom hole longitude"
                  type="text"
                  value={formData.bottom_hole_longitude}
                  onChange={handleChange}
                />
                <InputRightAddon>°</InputRightAddon>
              </InputGroup>
              {errorForms["bottom_hole_longitude"] && (
                <FormErrorMessage>
                  Bottom hole longitude is required
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>
          <GridItem>
            <FormControl isInvalid={!!errorForms["bottom_hole_latitude"]}>
              <HeaderForm
                title={"Bottom Hole Latitude"}
                desc={
                  "Latitude of bottom hole point projected to surface. For straight wells this would be exactly the same as surface latitude or null"
                }
              />
              <InputGroup>
                <Input
                  name="bottom_hole_latitude"
                  placeholder="Bottom hole latitude"
                  type="text"
                  value={formData.bottom_hole_latitude}
                  onChange={handleChange}
                />
                <InputRightAddon>°</InputRightAddon>
              </InputGroup>
              {errorForms["bottom_hole_latitude"] && (
                <FormErrorMessage>
                  Bottom hole latitude is required
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};


export default WellLocation;