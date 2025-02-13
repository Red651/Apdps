import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Image,
  List,
  ListItem,
  Collapse,
  Icon,
  Text,
  Button,
} from "@chakra-ui/react";
import {
  FaHome,
  FaTools,
  FaMap,
  FaToolbox,
  FaCog,
  FaHammer,
  FaCogs,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import Logo from "../../../assets/logo.png";
import { useLocation, Link, useNavigate } from "react-router-dom";

const SidebarKKS = ({ handleMenuValue }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [onClickPage, setOnClickPage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.includes("/dashboard/submission")) {
      setOnClickPage("submission");
    } else if (location.pathname.includes("/dashboard/operasi")) {
      setOnClickPage("operation");
    } else if (location.pathname.includes("/dashboard/ppp")) {
      setOnClickPage("ppp");
    } else if (location.pathname.includes("/dashboard")) {
      setOnClickPage("homeDash");
    }
  }, [location.pathname]);

  const handleMenuClick = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleExplorationClick = () => {
    navigate("/skk/exploration");
    handleMenuClick("exploration");
  };

  return (
    <Box
      bg="white"
      w="250px"
      h="100vh"
      p={4}
      color="#10042C"
     boxShadow= '0px 1px 2px rgba(0, 0, 0, 0.10)'
      position="sticky"
      top={0}
      overflowY="auto"
    >
      <Box
        flex={1}
        margin={"auto"}
        justifyItems={"center"}
        w={"fit-content"}
        marginBottom={"30px"}
      >
        <Image src={Logo} alt="Logo" w={"120px"} />
      </Box>
      <VStack align="start" spacing={4}>
        <Button
          as={Link}
          to="/skk/dashboard"
          px={4}
          py={4}
          rounded="md"
          _hover={{ bg: "#f5f5f5" }}
          width="full"
          justifyContent="flex-start"
          leftIcon={<Icon as={FaHome} />}
          variant="ghost"
        >
          Dashboard
        </Button>

        {/* Exploration Section */}
        <Box width="full">
          <Button
            px={4}
            py={4}
            rounded="md"
            _hover={{ bg: "#f5f5f5" }}
            width="full"
            justifyContent="flex-start"
            onClick={() => handleMenuClick("exploration")}
            as={Link}
            to={"/skk/exploration"}
            leftIcon={<Icon as={FaMap} />}
            rightIcon={
              openMenu === "exploration" ? (
                <FaChevronDown />
              ) : (
                <FaChevronRight />
              )
            }
            variant="ghost"
          >
            Exploration
          </Button>
          <Collapse in={openMenu === "exploration"}>
            <List spacing={2} pl={4} mt={2} styleType="none">
              <ListItem>
                <Button
                  as={Link}
                  to="/skk/exploration/planningexploration"
                  px={3}
                  py={2}
                  rounded="md"
                  bg={onClickPage === "submission" ? "#e0e0e0" : "none"}
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  justifyContent="flex-start"
                  leftIcon={<Icon as={FaToolbox} />}
                  variant="ghost"
                >
                  Planning
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/development/operations"
                  isDisabled={true}
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaCog} />}
                  variant="ghost"
                  
                >
                  Operasional
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/ppp"
                  isDisabled={true}
                  px={3}
                  py={2}
                  rounded="md"
                  bg={onClickPage === "ppp" ? "#e0e0e0" : "none"}
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  justifyContent="flex-start"
                  leftIcon={<Icon as={FaToolbox} />}
                  variant="ghost"
                >
                  PPP
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  px={3}
                  py={2}
                  isDisabled={true}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaCog} />}
                  variant="ghost"
                >
                  Close Out
                </Button>
              </ListItem>
            </List>
          </Collapse>
        </Box>

        {/* Development Section */}
        <Box width="full">
          <Button
            px={4}
            py={4}
            rounded="md"
            _hover={{ bg: "#f5f5f5" }}
            width="full"
            justifyContent="flex-start"
            as={Link}
            to={"/skk/development"}
            onClick={() => handleMenuClick("development")}
            leftIcon={<Icon as={FaTools} />}
            rightIcon={
              openMenu === "development" ? (
                <FaChevronDown />
              ) : (
                <FaChevronRight />
              )
            }
            variant="ghost"
          >
            Development
          </Button>
          <Collapse in={openMenu === "development"}>
            <List spacing={2} pl={4} mt={2} styleType="none">
              <ListItem>
                <Button
                  as={Link}
                  to="/skk/development/planningdevelopment"
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaToolbox} />}
                  variant="ghost"
                >
                  Planning
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/development/operations"
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  isDisabled={true}
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaCog} />}
                  variant="ghost"
                >
                  Operasional
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/development/p3"
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  isDisabled={true}
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaToolbox} />}
                  variant="ghost"
                >
                  PPP
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/development/closeout"
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaCog} />}
                  isDisabled={true}
                  variant="ghost"
                >
                  Close Out
                </Button>
              </ListItem>
            </List>
          </Collapse>
        </Box>

        {/* Work Over Section */}
        <Box width="full">
          <Button
            as={Link}
            to="/skk/workover"
            px={4}
            py={4}
            rounded="md"
            _hover={{ bg: "#f5f5f5" }}
            width="full"
            justifyContent="flex-start"
            onClick={() => handleMenuClick("workover")}
            leftIcon={<Icon as={FaHammer} />}
            rightIcon={
              openMenu === "workover" ? <FaChevronDown /> : <FaChevronRight />
            }
            variant="ghost"
          >
            Work Over
          </Button>
          <Collapse in={openMenu === "workover"}>
            <List spacing={2} pl={4} mt={2} styleType="none">
              <ListItem>
                <Button
                  as={Link}
                  to="/skk/workover/planningworkover"
                  
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaToolbox} />}
                  variant="ghost"
                >
                  Planning
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/workover/operations"
                  px={3}
                  isDisabled={true}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaCog} />}
                  variant="ghost"
                >
                  Operasional
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/workover/p3"
                  px={3}
                  py={2}
                  isDisabled={true}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaToolbox} />}
                  variant="ghost"
                >
                  PPP
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/workover/closeout"
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  isDisabled={true}
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaCog} />}
                  variant="ghost"
                >
                  Close Out
                </Button>
              </ListItem>
            </List>
          </Collapse>
        </Box>

        {/* Well Service Section */}
        <Box width="full">
          <Button
            px={4}
            py={4}
            rounded="md"
            as={Link}
            to="/skk/wellservice"
            _hover={{ bg: "#f5f5f5" }}
            width="full"
            justifyContent="flex-start"
            onClick={() => handleMenuClick("wellservice")}
            leftIcon={<Icon as={FaCogs} />}
            rightIcon={
              openMenu === "wellservice" ? (
                <FaChevronDown />
              ) : (
                <FaChevronRight />
              )
            }
            variant="ghost"
          >
            Well Service
          </Button>
          <Collapse in={openMenu === "wellservice"}>
            <List spacing={2} pl={4} mt={2} styleType="none">
              <ListItem>
                <Button
                  as={Link}
                  to="/skk/wellservice/planningwellservice"
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaToolbox} />}
                  variant="ghost"
                >
                  Planning
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/wellservice/operations"
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  isDisabled={true}
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaCog} />}
                  variant="ghost"
                >
                  Operasional
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/wellservice/p3"
                  px={3}
                  py={2}
                  rounded="md"
                  isDisabled={true}
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaToolbox} />}
                  variant="ghost"
                >
                  PPP
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/wellservice/closeout"
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  isDisabled={true}
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaCog} />}
                  variant="ghost"
                >
                  Close Out
                </Button>
              </ListItem>
            </List>
          </Collapse>
          <Collapse in={openMenu === "wellservice"}>
            <List spacing={2} pl={4} mt={2} styleType="none">
              <ListItem>
                <Button
                  as={Link}
                  to="/skk/wellservice/planningwellservice"
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaToolbox} />}
                  variant="ghost"
                >
                  Machine Learning
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/wellservice/operations"
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  isDisabled={true}
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaCog} />}
                  variant="ghost"
                >
                  Operasional
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/wellservice/p3"
                  px={3}
                  py={2}
                  rounded="md"
                  isDisabled={true}
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaToolbox} />}
                  variant="ghost"
                >
                  PPP
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  as={Link}
                  to="/dashboard/wellservice/closeout"
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "#e0e0e0" }}
                  width="full"
                  isDisabled={true}
                  justifyContent="flex-start"
                  bg="#f9f9f9"
                  leftIcon={<Icon as={FaCog} />}
                  variant="ghost"
                >
                  Close Out
                </Button>
              </ListItem>
            </List>
          </Collapse>
        </Box>
      </VStack>
    </Box>
  );
};

export default SidebarKKS;
