import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
  Icon,
  Skeleton,
} from "@chakra-ui/react";
import { useLocation, Link } from "react-router-dom";
import { IconHome } from "@tabler/icons-react";

const BreadcrumbCard = ({ wellName, uppercaseSegments = [], disabledSegments = [] }) => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  
  const isSkkPath = segments[0] === "skk";

  const getHomeUrl = () => {
    const wellId = segments[2];
    if (wellId && wellId.match(/[0-9a-fA-F-]{36}/)) {
      return `/view/planning/${wellId}`;
    }
    return isSkkPath ? "/skk" : "/";
  };

  const segmentToTitle = (segment, wellName) => {
    const titleMap = {
      // Title mapping for specific segments
    };

    if (segment.match(/[0-9a-fA-F-]{36}/)) {
      return wellName || <Skeleton width="150px" height="20px" />;
    }

    if (uppercaseSegments.includes(segment.toLowerCase())) {
      return segment.toUpperCase();
    }

    return titleMap[segment.toLowerCase()] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <Breadcrumb separator="/" spacing="8px" aria-label="breadcrumb" color="gray.600" fontFamily={"Mulish"}>
      <BreadcrumbItem>
        <BreadcrumbLink as={Link} to={getHomeUrl()} aria-current="page" display="flex" alignItems="center">
          <Icon as={IconHome} boxSize={4} mr={2} />
          Home
        </BreadcrumbLink>
      </BreadcrumbItem>

      {segments.map((segment, index) => {
        if (isSkkPath && index === 0) return null;

        const isDisabled = disabledSegments.includes(segment.toLowerCase());

        return (
          <BreadcrumbItem
            key={index}
            isCurrentPage={index === segments.length - 1}
            _last={{ fontWeight: "bold", color: "blue.600" }}
            _hover={{ color: isDisabled ? "gray.500" : "blue.500" }}
            style={{
              pointerEvents: isDisabled ? "none" : "auto", // Menonaktifkan interaksi klik
            }}
          >
            <BreadcrumbLink
              as={Link}
              to={`/${segments.slice(0, index + 1).join("/")}`}
              aria-current={index === segments.length - 1 ? "page" : undefined}
              display="flex"
              alignItems="center"
            >
              <Text fontWeight={index === segments.length - 1 ? "bold" : undefined} color={index === segments.length - 1 ? "blue.500" : undefined}>
                {segmentToTitle(segment, wellName)}
              </Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};


export default BreadcrumbCard;


