import { Grid, GridItem } from "@chakra-ui/react";
import React from "react";


const Item = ({ children,colSpan }) => {
    return (
        <GridItem
        colSpan={colSpan}
            gap={1}
            width="100%"
        >
            {children}
        </GridItem>
    );
};


const GridLayout = ({ children, Columns, Gap }) => {
  return (
    <Grid templateColumns={`repeat(${Columns}, 1fr)`} gap={Gap}>
      {children}
    </Grid>
  );
};

GridLayout.Item = Item;

export default GridLayout;
