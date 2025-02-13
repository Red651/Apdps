import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Flex,
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack,
  useDisclosure,
  Button,
  MenuDivider,
  VStack,
  Collapse,
} from "@chakra-ui/react";
import { BellIcon, HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { FaRegClock } from "react-icons/fa";
import { useAuth } from "../../../Auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const NavbarKKKS = ({ appName = "App", nameUser }) => {
  const { logout } = useAuth();
  const navigator = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [openMenu, setOpenMenu] = useState(null);

  const logoutOnClick = () => {
    logout();
    navigator("/");
  };

  const [notifications] = useState([
    { message: "You have a new message!", time: "2 mins ago", icon: "📩" },
    { message: "Your profile was updated.", time: "10 mins ago", icon: "🔄" },
    { message: "New comment on your post.", time: "30 mins ago", icon: "💬" },
  ]);

  const handleMenuClick = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <Box
      bg="white"
      boxShadow="0px 1px 2px rgba(0, 0, 0, 0.10)"
      borderRadius="2xl"
      w={"100%"}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
          color="#10042C"
        />
        <Box
          color="#10042C"
          // fontSize="xs"
          textTransform="uppercase"
          fontWeight="bold"
          Size="xs"
        >
          {appName}
        </Box>
        <Flex alignItems="center" gap={4}>
          <Menu borderRadius="lg">
            <MenuButton
              as={IconButton}
              aria-label="notifications"
              icon={<BellIcon />}
              variant="ghost"
              color="#10042C"
            />
            <MenuList w="300px" px={4} py={4} borderRadius="lg" zIndex={10}>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <MenuItem key={index} borderRadius="lg">
                    <HStack>
                      <Text fontSize="xl">{notification.icon}</Text>
                      <Box>
                        <Text fontSize="md">{notification.message}</Text>
                        <HStack spacing={1}>
                          <FaRegClock color="#718096" />
                          <Text fontSize="sm" color="#718096">
                            {notification.time}
                          </Text>
                        </HStack>
                      </Box>
                    </HStack>
                  </MenuItem>
                ))
              ) : (
                <MenuItem>No new notifications</MenuItem>
              )}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              rounded="full"
              variant="link"
              cursor="pointer"
              minW={0}
            >
              <HStack>
                <Text textTransform="uppercase">{nameUser}</Text>
                <Avatar size="sm" src="https://bit.ly/sage-adebayo" />
              </HStack>
            </MenuButton>
            <MenuList backgroundColor="white" zIndex={10}>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuDivider />
              <MenuItem onClick={logoutOnClick}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: "none" }}>
          <VStack spacing={4} align="start">
            <MenuLink label="Dashboard" link="/skk/dashboard" />
            <MenuDropdown
              label="Exploration"
              isOpen={openMenu === "exploration"}
              onClick={() => handleMenuClick("exploration")}
            >
              <MenuLink
                label="Planning"
                link="/skk/exploration/planningexploration"
              />
              <MenuLink
                label="Operasional"
                link="/skk/exploration/operationexploration"
              />
              <MenuLink label="PPP" link="/skk/exploration/pppexploration" />
              <MenuLink
                label="Close Out"
                link="/skk/exploration/closeoutexploration"
              />
            </MenuDropdown>
            <MenuDropdown
              label="Development"
              isOpen={openMenu === "development"}
              onClick={() => handleMenuClick("development")}
            >
              <MenuLink
                label="Planning"
                link="/skk/development/planningdevelopment"
              />
              <MenuLink
                label="Operasional"
                link="/skk/development/operationsdevelopment"
              />
              <MenuLink label="PPP" link="/skk/development/pppdevelopment" />
              <MenuLink
                label="Close Out"
                link="/skk/development/closeoutdevelopment"
              />
            </MenuDropdown>
            <MenuDropdown
              label="Work Over"
              isOpen={openMenu === "workover"}
              onClick={() => handleMenuClick("workover")}
            >
              <MenuLink
                label="Planning"
                link="/skk/workover/planningworkover"
              />
              <MenuLink
                label="Operasional"
                link="/skk/workover/operationsworkover"
              />
              <MenuLink label="PPP" link="/skk/workover/pppworkover" />
              <MenuLink
                label="Close Out"
                link="/skk/workover/closeoutworkover"
              />
            </MenuDropdown>
            <MenuDropdown
              label="Well Service"
              isOpen={openMenu === "wellservice"}
              onClick={() => handleMenuClick("wellservice")}
            >
              <MenuLink
                label="Planning"
                link="/skk/wellservice/planningwellservice"
              />
              <MenuLink
                label="Operasional"
                link="/skk/wellservice/operationswellservice"
              />
              <MenuLink label="PPP" link="/skk/wellservice/pppwellservice" />
              <MenuLink
                label="Close Out"
                link="/skk/wellservice/closeoutwellservice"
              />
            </MenuDropdown>
            <MenuLink label="Well Master" link="#" />
            <MenuLink label="Machine Learning" link="/skk/MachineLearning" />
            <MenuLink label="Report" link="#" />
            <MenuLink label="MAP" link="/skk/map" />

            <MenuLink label="Guideline" link="/docs" />
            <MenuLink label="Admin" link="/admin" />
          </VStack>
        </Box>
      ) : null}
    </Box>
  );
};

const MenuLink = ({ label, link }) => (
  <Button
    as={Link}
    to={link}
    w="full"
    textAlign="left"
    py={2}
    variant="ghost"
    _hover={{ bg: "#f0f0f0" }}
  >
    {label}
  </Button>
);

// Komponen untuk dropdown menu
const MenuDropdown = ({ label, isOpen, onClick, children }) => (
  <Box w="full">
    <Button
      onClick={onClick}
      w="full"
      textAlign="left"
      py={2}
      variant="ghost"
      _hover={{ bg: "#f0f0f0" }}
    >
      {label}
    </Button>
    <Collapse in={isOpen}>{children}</Collapse>
  </Box>
);

NavbarKKKS.propTypes = {
  appName: PropTypes.string,
};

export default NavbarKKKS;
