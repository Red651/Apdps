import React, { useState, useEffect } from "react";
import {
  Flex,
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  Image,
  HStack,
  Icon,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginImage from "../assets/login-images.jpg";
import SplashScreen from "./../Page/Components/SplashScreen";
import { IconArrowRight, IconUser, IconLock } from "@tabler/icons-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showSplashScreen, setShowSplashScreen] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_URL}/auth/token`,
        new URLSearchParams({
          username: username,
          password: password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const token = response.data.access_token;
      localStorage.setItem("token", token);

      const userResponse = await axios.get(
        `${import.meta.env.VITE_APP_URL}/auth/user/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userDetails = userResponse.data;

      login(userDetails, token); // Kirim userDetails dan token ke fungsi login di AuthContext

      // Tampilkan splash screen
      setShowSplashScreen(true);
      localStorage.setItem("splashScreenShown", true); // Set splash screen status
    } catch (error) {
      console.error(error);
      if (error.response) {
        setErrorMessage(() => {
          const details = "Incorrect Username or Password";
          return details;
        });
      }
    }
  };

  const handleSplashScreenComplete = () => {
    navigate("/");
  };

  if (showSplashScreen) {
    return <SplashScreen onAnimationComplete={handleSplashScreenComplete} />;
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.100"
      p={8}
      fontFamily={"Mulish"}
    >
      <Flex
        maxW="150vh"
        h="80vh"
        w="full"
        bg="white"
        p={8}
        borderRadius="2xl"
        boxShadow="md"
        alignItems="center"
        gap={4}
      >
        <Box w="50%" mr={6}>
          <Heading mb={2} textAlign="left" fontFamily={"Mulish"}>
            User Login
          </Heading>
          <Text fontSize="lg" mb={6}>
            Please log in to manage your system.
          </Text>
          <form onSubmit={handleLogin}>
            <VStack spacing={10}>
              <FormControl id="username" isRequired>
                <FormLabel>Username</FormLabel>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={IconUser} color="gray" />
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={IconLock} color="gray" />
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              {errorMessage && <Text color="red.500">{errorMessage}</Text>}

              <Button
                mt={4}
                colorScheme="blue"
                size={"lg"}
                type="submit"
                width="full"
                leftIcon={<Icon as={IconArrowRight} />}
              >
                Log In
              </Button>
            </VStack>
            {/* <HStack justifyContent={"Center"} mt={2}>
              <Text>Don't have an account?</Text>
              <Button
                colorScheme="blue"
                variant="link"
                size={"lg"}
                // onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </HStack> */}
          </form>
        </Box>
        <Box w="50%" h="full" objectPosition="center">
          <Image
            src={LoginImage}
            alt="Login Image"
            objectFit="cover"
            borderRadius="md"
            w="full"
            h="full"
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default Login;
