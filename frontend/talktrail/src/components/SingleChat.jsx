import React, { useEffect, useState } from "react";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { ChatState } from "../Context/ChatProvider";
import {
  FormControl,
  IconButton,
  Spinner,
  useToast,
  Input,
  Tooltip,
} from "@chakra-ui/react";
import { saveAs } from "file-saver";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./ProfileModal";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import ScrollableChats from "./ScrollableChats";
import axios from "axios";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animation/typing.json";
// const ENDPOINT = "https://talktrail-production.up.railway.app";
const ENDPOINT = "https://talktrail.onrender.com";
// const ENDPOINT = "https://talk-trail-bdyl.vercel.app";
// const ENDPOINT = "https://talktrail.onrender.com";
// const ENDPOINT = "http://localhost:3001";

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useToast();
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (selectedChat?._id) {
        axios
          .post(`/api/recommendations/${selectedChat._id}`, {
            userId: user._id,
            query: newMessage,
          })
          .then((res) => {
            setSuggestion(res.data.suggestion);
            console.log(res.data.suggestion);
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(delayDebounce);
  }, [newMessage, selectedChat?._id]);
  const fetchMessages = async () => {
    if (!selectedChat) {
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(
        `api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Ocuured!",
        description: "Failed to Load the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  // Ensure axios is imported

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (err) {
        toast({
          title: "Error Ocuured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
    });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);
  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });
  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timelength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timelength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timelength);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Tab" && suggestion) {
      e.preventDefault();
      setNewMessage(suggestion);
      setSuggestion("");
    }
  };
  const [btnloading, setBtnLoading] = useState(false);

  const handleDownloadSummary = async () => {
    try {
      setBtnLoading(true);
      const res = await axios.get(
        `/api/recommendations/summary/${selectedChat._id}`
      );
      const summary = res.data.summary;
      const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `chat-summary-${selectedChat._id}.txt`);
    } catch (error) {
      console.error("Summary download failed:", error);
      alert("Failed to download summary.");
    } finally {
      setBtnLoading(false);
    }
  };
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            m={0}
            pt={2}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            className="bg-purple-200 rounded-md"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<i class="fi fi-rr-arrow-left bg-transparent"></i>}
              onClick={() => setSelectedChat("")}
              className="bg-purple-50"
              colorScheme="purple"
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <div className="flex gap-2">
                  {" "}
                  <Tooltip label="Download chat summary">
                    <IconButton
                      icon={<i class="fi fi-sr-file-download"></i>}
                      onClick={handleDownloadSummary}
                      className="bg-purple-50"
                      colorScheme="purple"
                      aria-label="Download Chat Summary"
                      isDisabled={btnloading}
                    />
                  </Tooltip>
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </div>
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <Tooltip label="Download chat summary">
                  <IconButton
                    icon={<i class="fi fi-sr-file-download"></i>}
                    onClick={handleDownloadSummary}
                    className="bg-purple-50"
                    colorScheme="purple"
                    aria-label="Download Chat Summary"
                    isDisabled={btnloading}
                  />
                </Tooltip>
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
            className="bg-purple-100"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              ></Spinner>
            ) : (
              <div className="flex flex-col overflow-y-scroll">
                <ScrollableChats messages={messages}></ScrollableChats>
              </div>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping && (
                <div>
                  <Lottie
                    options={defaultOptions}
                    className="bg-transparent"
                    width={70}
                  ></Lottie>
                </div>
              )}
              <Input
                className="hover:bg-purple-200 border-purple-400"
                variant="outline"
                bg="purple.100"
                focusBorderColor="purple.400"
                placeholder="Enter a message"
                onChange={typingHandler}
                value={newMessage}
                onKeyDown={handleKeyDown}
              ></Input>
              {newMessage === "" && suggestion && (
                <div className="text-gray-400 italic mt-1">
                  Suggested: {suggestion}
                </div>
              )}

              {newMessage !== "" && suggestion && (
                <div className="text-blue-500 italic mt-1">
                  Completion: {suggestion}
                </div>
              )}
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
