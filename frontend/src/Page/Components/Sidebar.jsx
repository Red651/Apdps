import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Avatar,
  Box,
  VStack,
  Text,
  Collapse,
  Icon,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Flex,
  Tooltip,
  useDisclosure,
  Spinner,
  Portal,
  IconButton,
} from "@chakra-ui/react";
import {
  IconHomeFilled,
  IconRotateClockwise,
  IconBriefcaseFilled,
  IconGraphFilled,
  IconTool,
  IconSettings,
  IconChevronDown,
  IconChevronRight,
  IconBrain,
  IconClipboardData,
  IconMap2,
  IconDatabase,
  IconUser,
  IconBook,
  IconCylinder,
  IconCircleCheck,
  IconChartHistogram,
  IconDropletHalfFilled,
  IconDropletHalf,
  IconFilePencil,
  IconFileStack,
  IconChecklist,
  IconBuildingLighthouse,
} from "@tabler/icons-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { getStatusSidebar, getJobWellSidebar } from "../API/APISidebar";
import { debounce } from "lodash";
// import { useAuth } from "../../../Auth/AuthContext";

const SidebarKKS = React.memo(({ userName, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [openStatusMenu, setOpenStatusMenu] = useState(null);
  const [onClickPage, setOnClickPage] = useState("");
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
  const [statusSidebar, setStatusSidebar] = useState({});
  const [jobWellSidebar, setJobWellSidebar] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedMenu, setSelectedMenu] = useState("");
  const jobPhases = useMemo(
    () => [
      { label: "Planning", value: "planning", icon: IconFilePencil },
      { label: "Operation", value: "operational", icon: IconSettings },
      { label: "PPP", value: "ppp", icon: IconFileStack },
      { label: "Close Out", value: "co", icon: IconChecklist },
    ],
    []
  );
  // const { logout, userName } = useAuth();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      navigate("/");
    }
  };

  const debouncedFetchJobData = useCallback(
    debounce(async (job_type, job_phase) => {
      setLoading((prev) => ({ ...prev, [`${job_type}-${job_phase}`]: true }));
      try {
        const statusResponse = await getStatusSidebar(job_type, job_phase);
        setStatusSidebar((prevState) => ({
          ...prevState,
          [job_type]: {
            ...prevState[job_type],
            [job_phase]: statusResponse.data,
          },
        }));

        const approvedStatus = Object.keys(statusResponse.data).find(
          (key) => statusResponse.data[key] === true
        );

        if (approvedStatus) {
          const adjustedJobPhase =
            job_phase === "operational" ? "operation" : job_phase;

          const jobWellResponse = await getJobWellSidebar(
            adjustedJobPhase,
            job_type,
            approvedStatus
          );

          setJobWellSidebar((prevState) => ({
            ...prevState,
            [job_type]: {
              ...prevState[job_type],
              [adjustedJobPhase]: jobWellResponse.data.jobs || [],
            },
          }));
        }
      } catch (error) {
        console.error("Error fetching job data", error);
        setJobWellSidebar((prevState) => ({
          ...prevState,
          [job_type]: {
            ...prevState[job_type],
            [job_phase]: [],
          },
        }));
      } finally {
        setLoading((prev) => ({
          ...prev,
          [`${job_type}-${job_phase}`]: false,
        }));
      }
    }, 300),
    []
  );

  useEffect(() => {
    const path = location.pathname.split("/").slice(1);
    setOnClickPage(path.join("/"));
  }, [location.pathname]);

  const handleMenuClick = useCallback(
    (menuName, path) => {
      if (!path) {
        setOpenMenu((prevOpenMenu) =>
          prevOpenMenu === menuName ? null : menuName
        );
      }
      if (path && menuName) {
        setSelectedMenu(menuName);
        navigate(path);
      }
    },
    [navigate]
  );

  const handleSubMenuClick = useCallback(
    (job_type, job_phase, isChevronClick) => {
      if (isChevronClick) {
        setOpenSubMenu((prevOpenSubMenu) =>
          prevOpenSubMenu === `${job_type}-${job_phase}`
            ? null
            : `${job_type}-${job_phase}`
        );
        if (!statusSidebar[job_type]?.[job_phase]) {
          debouncedFetchJobData(job_type, job_phase);
        }
      } else {
        const path =
          job_phase === "co"
            ? `/${job_type.toLowerCase()}/closeout`
            : job_phase === "operational"
            ? `/${job_type.toLowerCase()}/operation`
            : `/${job_type.toLowerCase()}/${job_phase}`;

        setSelectedMenu(`${job_type}-${job_phase}`);
        navigate(path);
      }
    },
    [statusSidebar, debouncedFetchJobData, navigate]
  );

  const getJobLink = (job_phase, job_type, jobs) => {
    switch (job_phase) {
      case "planning":
        if (jobs.STATUS === "APPROVED") {
          return `/${job_type.toLowerCase()}/planning/view/${jobs.job_id}`;
        } else if (["PROPOSED", "RETURNED"].includes(jobs.STATUS)) {
          return `/${job_type.toLowerCase()}/planning/edit/${jobs.job_id}`;
        }
        return `/${job_type.toLowerCase()}/planning/view/${jobs.job_id}`;
      case "operational":
        if (jobs.STATUS === "OPERATING") {
          return `/${job_type.toLowerCase()}/operation/update/${jobs.job_id}`;
        } else if (jobs.STATUS === "PLAN APPROVED") {
          return `/${job_type.toLowerCase()}/operation/wrm/${jobs.job_id}`;
        }
        return `/${job_type.toLowerCase()}/operation/view/${jobs.job_id}`;
      case "ppp":
        if (jobs.STATUS === "OPERATION FINISHED") {
          return `/${job_type.toLowerCase()}/ppp/form/${jobs.job_id}`;
        }
        return `/${job_type.toLowerCase()}/ppp/view/${jobs.job_id}`;
      case "co":
        return `/${job_type.toLowerCase()}/closeout`;
      default:
        return `/default/view/${jobs.job_id}`;
    }
  };

  const handleStatusMenuClick = useCallback((job_type, job_phase, status) => {
    setOpenStatusMenu((prevOpenStatusMenu) =>
      prevOpenStatusMenu === `${job_type}-${job_phase}-${status}`
        ? null
        : `${job_type}-${job_phase}-${status}`
    );
    setSelectedMenu(`${job_type}-${job_phase}-${status}`);
  }, []);

  const renderJobStatus = useCallback(
    (job_type, job_phase) => {
      const status = statusSidebar[job_type]?.[job_phase];
      if (!status) return null;

      const adjustedJobPhase =
        job_phase === "operational" ? "operation" : job_phase;

      return Object.entries(status)
        .filter(([_, value]) => value === true)
        .map(([key, value]) => (
          <SidebarStatusMenu
            key={key}
            label={key}
            value={value}
            isOpen={isOpen}
            isExpanded={
              openStatusMenu === `${job_type}-${adjustedJobPhase}-${key}`
            }
            selected={selectedMenu === `${job_type}-${adjustedJobPhase}-${key}`}
            onToggle={() =>
              handleStatusMenuClick(job_type, adjustedJobPhase, key)
            }
            tooltip={`${key} Status`}
          >
            {jobWellSidebar[job_type]?.[adjustedJobPhase]?.map((well) => (
              <SidebarSubItem
                key={well.job_id}
                label={well.NAMA_SUMUR}
                link={getJobLink(job_phase, job_type, well)}
                selected={onClickPage === getJobLink(job_phase, job_type, well)}
                isOpen={isOpen}
                icon={IconCylinder}
                tooltip={well.NAMA_SUMUR}
                job_phase={job_phase}
              />
            ))}
          </SidebarStatusMenu>
        ));
    },
    [
      statusSidebar,
      jobWellSidebar,
      isOpen,
      openStatusMenu,
      selectedMenu,
      onClickPage,
      handleStatusMenuClick,
    ]
  );

  const renderJobPhaseMenu = useCallback(
    (job_type, phases) => {
      return phases.map((phase) => (
        <SidebarSubMenu
          key={`${job_type}-${phase.label}`}
          label={phase.label}
          icon={phase.icon}
          isOpen={isOpen}
          isExpanded={openSubMenu === `${job_type}-${phase.value}`}
          selected={selectedMenu === `${job_type}-${phase.value}`}
          onToggle={(isChevronClick) =>
            handleSubMenuClick(job_type, phase.value, isChevronClick)
          }
          job_type={job_type}
          phase={phase}
          tooltip={`${phase.label} ${job_type}`}
        >
          {loading[`${job_type}-${phase.value}`] ? (
            <Spinner size="sm" />
          ) : jobWellSidebar[job_type]?.[phase.value]?.length === 0 ? (
            <Text pl={4} py={2} fontSize="sm" color="gray.500">
              Tidak ada well
            </Text>
          ) : (
            renderJobStatus(job_type, phase.value)
          )}
        </SidebarSubMenu>
      ));
    },
    [
      isOpen,
      openSubMenu,
      selectedMenu,
      loading,
      jobWellSidebar,
      renderJobStatus,
      handleSubMenuClick,
    ]
  );

  return (
    <Flex
      direction="row"
      h="100vh"
      display={{ base: "none", md: "flex" }}
      position="sticky"
      top={0}
    >
      <Box
        bg="white"
        w={isOpen ? "250px" : "90px"}
        h="100vh"
        color="#10042C"
        boxShadow="0px 1px 2px rgba(0, 0, 0, 0.10)"
        position="sticky"
        top={0}
        fontFamily={"Mulish"}
        transition="width 0.3s ease"
        borderRight="1px solid #e0e0e0"
        display="flex"
        flexDirection="column"
      >
        <Box p={4} mb="30px" textAlign="center">
          <Text fontWeight="bold" fontSize="2xl">
            ApDPS
          </Text>
        </Box>
        <Box flex="1" overflowY="auto" px={4}>
          <VStack align="start" spacing={4}>
            <SidebarItem
              icon={IconHomeFilled}
              label="Dashboard"
              isOpen={isOpen}
              link="/dashboard"
              selected={selectedMenu === "dashboard"}
              onClick={() => handleMenuClick("dashboard", "/dashboard")}
            />
            <SidebarMenu
              label="Exploration"
              icon={IconDropletHalf}
              isOpen={isOpen}
              isExpanded={openMenu === "exploration"}
              selected={selectedMenu === "exploration"}
              onToggle={() => handleMenuClick("exploration")}
              tooltip="Exploration"
            >
              {renderJobPhaseMenu("EXPLORATION", jobPhases)}
            </SidebarMenu>
            <SidebarMenu
              label="Development"
              icon={IconDropletHalfFilled}
              isOpen={isOpen}
              isExpanded={openMenu === "development"}
              selected={selectedMenu === "development"}
              onToggle={() => handleMenuClick("development")}
              tooltip="Development"
            >
              {renderJobPhaseMenu("DEVELOPMENT", jobPhases)}
            </SidebarMenu>
            <SidebarMenu
              label="Work Over"
              icon={IconRotateClockwise}
              isOpen={isOpen}
              isExpanded={openMenu === "workover"}
              selected={selectedMenu === "workover"}
              onToggle={() => handleMenuClick("workover")}
              tooltip="Work Over"
            >
              {renderJobPhaseMenu("WORKOVER", jobPhases)}
            </SidebarMenu>
            <SidebarMenu
              label="Well Service"
              icon={IconTool}
              isOpen={isOpen}
              isExpanded={openMenu === "wellservice"}
              selected={selectedMenu === "wellservice"}
              onToggle={() => handleMenuClick("wellservice")}
              tooltip="Well Service"
            >
              {renderJobPhaseMenu("WELLSERVICE", jobPhases)}
            </SidebarMenu>
            <SidebarItem
              label="Well Master"
              icon={IconDatabase}
              isOpen={isOpen}
              link="/wellmaster"
              tooltip="Well Master"
              selected={selectedMenu === "wellmaster"}
              onClick={() => handleMenuClick("wellmaster", "/wellmaster")}
            />
            <SidebarItem
              label="Rig Master"
              icon={IconBuildingLighthouse}
              isOpen={isOpen}
              link="/rig"
              tooltip="Rig Master"
              selected={selectedMenu === "rig"}
              onClick={() => handleMenuClick("rig", "/rig")}
            />
          </VStack>
        </Box>
        <Box p={4} borderTop="1px solid #e0e0e0">
          <VStack align="start" spacing={4}>
            <SidebarItem
              label="Guideline"
              icon={IconBook}
              isOpen={isOpen}
              link="docs"
              tooltip="Document"
              selected={onClickPage === "docs"}
              isDisabled={true}
            />
            <Box width="full">
              <Menu placement="right-start">
                <Tooltip label={userName} placement="right" isDisabled={isOpen}>
                  <MenuButton
                    as={Button}
                    width="full"
                    variant="ghost"
                    py={2}
                    _hover={{ bg: "#d0d0d0" }}
                  >
                    <Flex align="center" gap={2}>
                      <Avatar
                        size={isOpen ? "sm" : "xs"}
                        src="https://bit.ly/sage-adebayo"
                        name={userName}
                      />
                      {isOpen && (
                        <Text
                          fontSize="sm"
                          isTruncated
                          textTransform="uppercase"
                        >
                          {userName}
                        </Text>
                      )}
                    </Flex>
                  </MenuButton>
                </Tooltip>
                <Portal>
                  <MenuList zIndex={10}>
                    <MenuItem>Profile</MenuItem>
                    <MenuItem>Settings</MenuItem>
                    <MenuDivider />
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </MenuList>
                </Portal>
              </Menu>
            </Box>
          </VStack>
        </Box>
      </Box>
    </Flex>
  );
});

const SidebarItem = React.memo(
  ({
    icon,
    label,
    link,
    selected,
    isOpen,
    tooltip,
    isDisabled,
    target,
    onClick,
  }) => (
    <Tooltip label={tooltip} placement="right" isDisabled={isOpen}>
      <Button
        as={Link}
        to={link}
        px={4}
        py={2}
        target={target}
        rounded="md"
        width="full"
        justifyContent="flex-start"
        display="flex"
        alignItems="center"
        variant="ghost"
        bg={selected ? "#e0e0e0" : "transparent"}
        _hover={!isDisabled ? { bg: "#d0d0d0", transform: "scale(1.02)" } : {}}
        textAlign="left"
        transition="all 0.3s"
        gap={2}
        isDisabled={isDisabled}
        onClick={isDisabled ? (e) => e.preventDefault() : onClick}
      >
        <Icon as={icon} boxSize={isOpen ? 5 : 6} />
        {(isOpen || isDisabled) && <Text>{label}</Text>}
      </Button>
    </Tooltip>
  )
);

const SidebarSubItem = React.memo(
  ({ icon, label, link, selected, isOpen, tooltip, onClick, job_phase }) => {
    const isCO =
      job_phase?.toLowerCase() === "co" ||
      job_phase?.toLowerCase() === "closeout";
    return (
      <Tooltip label={tooltip} placement="right" isDisabled={isOpen}>
        <Button
          as={Link}
          to={link}
          // pl={16}
          py={2}
          rounded="md"
          width="full"
          justifyContent="flex-start"
          display="flex"
          alignItems="center"
          variant="ghost"
          color={isCO ? "#ccc" : "black"}
          bg={selected ? "#e0e0e0" : "transparent"}
          _hover={{
            cursor: isCO ? "not-allowed" : "pointer",
          }}
          textAlign="left"
          transition="all 0.3s"
          gap={2}
          onClick={isCO ? (e) => e.preventDefault() : onClick}
        >
          <Icon as={icon} boxSize={isOpen ? 4 : 5} />
          {isOpen && <Text fontSize="sm">{label}</Text>}
        </Button>
      </Tooltip>
    );
  }
);

const SidebarMenu = React.memo(
  ({
    label,
    icon,
    children,
    isOpen,
    isExpanded,
    onToggle,
    onOpened,
    tooltip,
    selected,
  }) => (
    <Tooltip label={tooltip} placement="right" isDisabled={isOpen}>
      <Box width="full">
        <Flex width="full" gap={1}>
          <Button
            px={4}
            py={2}
            rounded="md"
            width="full"
            justifyContent="flex-start"
            alignItems="center"
            display="flex"
            onClick={onOpened}
            variant="ghost"
            bg={selected ? "#ecf4ff" : "transparent"}
            _hover={{ bg: "#ecf4ff", transform: "scale(1.02)" }}
            textAlign="left"
            transition="all 0.3s"
          >
            <Flex alignItems="center" gap={2}>
              <Icon as={icon} boxSize={isOpen ? 5 : 6} />
              {isOpen && <Text>{label}</Text>}
            </Flex>
          </Button>
          <IconButton
            icon={
              isExpanded ? (
                <Icon as={IconChevronDown} />
              ) : (
                <Icon as={IconChevronRight} />
              )
            }
            variant="ghost"
            onClick={onToggle}
            aria-label="Toggle menu"
            size="sm"
            height={"40px"}
            _hover={{ bg: "#ecf4ff" }}
          />
        </Flex>
        <Collapse in={isExpanded}>
          <Box pl={4}>{children}</Box>
        </Collapse>
      </Box>
    </Tooltip>
  )
);

const SidebarSubMenu = React.memo(
  ({
    label,
    icon,
    children,
    isOpen,
    isExpanded,
    onToggle,
    tooltip,
    selected,
    job_type,
    phase,
  }) => {
    return (
      <Tooltip label={tooltip} placement="right" isDisabled={isOpen}>
        <Box width="full" mt={1}>
          <Flex width="full" gap={1}>
            <Button
              px={4}
              py={2}
              rounded="md"
              width="full"
              justifyContent="flex-start"
              alignItems="center"
              display="flex"
              onClick={() => onToggle(false)}
              variant="ghost"
              bg={selected ? "#ecf4ff" : "transparent"}
              _hover={{ bg: "#ecf4ff", transform: "scale(1.02)" }}
              textAlign="left"
              transition="all 0.3s"
            >
              <Flex alignItems="center" gap={2}>
                <Icon as={icon} boxSize={isOpen ? 5 : 6} />
                {isOpen && <Text>{label}</Text>}
              </Flex>
            </Button>
            <IconButton
              // alignItems={"center"}
              height={"40px"}
              icon={
                isExpanded ? (
                  <Icon as={IconChevronDown} />
                ) : (
                  <Icon as={IconChevronRight} />
                )
              }
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(true);
              }}
              aria-label="Toggle submenu"
              size="sm"
              _hover={{ bg: "#e0e0e0" }}
            />
          </Flex>
          <Collapse in={isExpanded}>
            <Box pl={4}>{children}</Box>
          </Collapse>
        </Box>
      </Tooltip>
    );
  }
);

const SidebarStatusMenu = React.memo(
  ({
    label,
    value,
    children,
    isOpen,
    isExpanded,
    onToggle,
    tooltip,
    selected,
  }) => {
    const getStatusColor = (status) => {
      switch (status.toUpperCase()) {
        case "APPROVED":
          return {
            bg: selected ? "green.100" : "transparent",
            hoverBg: "green.100",
            iconColor: "green.500",
            textColor: "green.500",
          };
        case "RETURNED":
          return {
            bg: selected ? "red.100" : "transparent",
            hoverBg: "red.100",
            iconColor: "red.500",
            textColor: "red.500",
          };
        case "OPERATING":
        case "FINISHED":
          return {
            bg: selected ? "blue.100" : "transparent",
            hoverBg: "blue.100",
            iconColor: "blue.500",
            textColor: "blue.500",
          };
        case "PROPOSED":
          return {
            bg: selected ? "green.100" : "transparent",
            hoverBg: "green.100",
            iconColor: "green.500",
            textColor: "green.500",
          };
        default:
          return {
            bg: selected ? "gray.100" : "transparent",
            hoverBg: "gray.100",
            iconColor: "gray.500",
            textColor: "gray.500",
          };
      }
    };

    const statusColors = getStatusColor(label);
    return (
      <Tooltip label={tooltip} placement="right" isDisabled={isOpen}>
        <Box width="full">
          <Flex width="full" alignItems="center">
            <Button
              px={4}
              py={2}
              rounded="md"
              width="full"
              justifyContent="space-between"
              alignItems="center"
              display="flex"
              // onClick={onToggle}
              variant="ghost"
              // bg={statusColors.bg}
              _hover={{
                bg: statusColors.hoverBg,
                transform: "scale(1.02)",
              }}
              textAlign="left"
              transition="all 0.3s"
            >
              <Flex alignItems="center" gap={2}>
                <Icon
                  as={IconCircleCheck}
                  color={statusColors.iconColor}
                  boxSize={isOpen ? 5 : 6}
                />
                {isOpen && (
                  <Text fontSize="sm" color={statusColors.textColor}>
                    {label}
                  </Text>
                )}
              </Flex>
              {/* {isExpanded ? (
                <Icon as={IconChevronDown} />
              ) : (
                <Icon as={IconChevronRight} />
              )} */}
            </Button>
            <IconButton
              icon={
                isExpanded ? (
                  <Icon as={IconChevronDown} />
                ) : (
                  <Icon as={IconChevronRight} />
                )
              }
              variant="ghost"
              onClick={onToggle}
              aria-label="Toggle status menu"
              size="xs"
              height="40px"
              minWidth="30px"
              _hover={{ bg: statusColors.hoverBg }}
            />
          </Flex>

          <Collapse in={isExpanded}>
            <Box pl={5}>{children}</Box>
          </Collapse>
        </Box>
      </Tooltip>
    );
  }
);

export default SidebarKKS;
