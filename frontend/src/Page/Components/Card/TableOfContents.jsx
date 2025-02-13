import { Box, Link, List, ListItem } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const TableOfContents = ({ headings }) => {
  const [activeId, setActiveId] = useState("");

  // Fungsi untuk menggulir dengan mulus ke heading saat diklik
  const handleClick = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveId(id); // Set activeId saat item di klik
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "+20% 0px -20% 0px", // Atur root margin untuk lebih akurat
        threshold: 0.5,
      }
    );

    // Observasi setiap heading berdasarkan id
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    // Hentikan observasi saat komponen unmount
    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  return (
    <List
      spacing={2}
      position="sticky"
      top={6}
      overflowY={"auto"}
      maxH={"100vh"}
    >
      {headings.map((heading, index) => (
        <ListItem
          key={index}
        >
          <Link
            onClick={() => handleClick(heading.id)} // Handle klik
            color="black"
            fontWeight={activeId === heading.id ? "bold" : ""}
            _hover={{ textDecoration: "none" }}
            cursor="pointer"
          >
            {heading.title}
          </Link>
        </ListItem>
      ))}
    </List>
    // </Box>
  );
};

export default TableOfContents;
