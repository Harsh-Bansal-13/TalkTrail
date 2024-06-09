import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import Login from "./Login";
import Signup from "./Signup";
const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (userInfo) navigate("/chats");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);
  return (
    <Container maxW="xl" centerContent>
      <Box
        className="w-full justify-center items-center text-5xl font-semibold bg-white flex p-3 rounded-lg"
        m="40px 0 15px 0px"
      >
        <Text>Talk-Trail</Text>
      </Box>
      <Box
        className="w-full justify-center items-center text-5xl font-semibold bg-white flex p-3 rounded-lg"
        m="40px 0 15px 0px"
      >
        <Tabs variant="soft-rounded" colorScheme="purple" width="100%">
          <TabList>
            <Tab width="50%" pt="10px">
              Login
            </Tab>
            <Tab width="50%" height="auto">
              Sign up
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login></Login>
            </TabPanel>
            <TabPanel>
              <Signup></Signup>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default HomePage;
