import { Heading, Text, Box, Flex, Button, Textarea } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { SSE } from "sse";
import { useToast } from "@chakra-ui/react";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

function App() {
  let [prompt, setPrompt] = useState("");
  let [response, setResponse] = useState("");
  let [isLoading, setIsLoading] = useState(false);

  const responseRef = useRef(response);
  const toast = useToast();

  useEffect(() => {
    responseRef.current = response;
  }, [response]);

  let handleClearBtnClicked = () => {
    setPrompt("");
    setResponse("");
  };

  let handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  let handleSubmitBtnClicked = async () => {
    if (prompt === "") {
      toast({
        // title: API_KEY == undefined ? "API Key is not set" : "Prompt is empty",
        title: "Prompt is empty",
        description: "Please enter a prompt",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } else {
      setIsLoading(true);
      let url = "https://api.openai.com/v1/completions";
      let data = {
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.9,
        top_p: 1,
        n: 1,
        stream: true,
      };

      let source = new SSE(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        method: "POST",
        payload: JSON.stringify(data),
      });

      source.addEventListener("message", (e) => {
        // console.log("Message: ", e.data);
        if (e.data != "[DONE]") {
          let payload = JSON.parse(e.data);
          let text = payload.choices[0].text;
          if (text != "\n") {
            // console.log("Text: ", text);
            responseRef.current += text;
            setResponse(responseRef.current);
          } else {
            source.close();
          }
        }
      });

      source.addEventListener("readystatechange", (e) => {
      if (e.readyState >= 2) {
        setIsLoading(false);
        // console.log(source.status);
        if (source.status === undefined) {
          toast({
            title: "API Key is not set",
            description: "Please check your API key and try again.",
            status: "error",
            duration: 2000,
            isClosable: true,
          });
        }
      }
    });
      source.stream();
    }
  };

  return (
    <Flex
      width={"100vw"}
      height={"100vh"}
      alignContent={"center"}
      justifyContent={"center"}
      bgGradient={"linear(to-b, #F9BF3B, #997c7e)"}
    >
      <Box
        boxShadow="dark-lg"
        maxW="2xl"
        m="auto"
        bg={"white"}
        p="20px"
        borderRadius={"md"}
      >
        <Heading mb={4}>AI website template🤖</Heading>
        <Text mb={4}>
          This is an example of using Nectar.js to seamlessly implement AI into the website or app of your choice with React, Vite.
        </Text>
        <Textarea
          value={prompt}
          onChange={handlePromptChange}
          placeholder={"Give me any sentence to complete.."}
        />
        <Button
          mt={4}
          isLoading={isLoading}
          loadingText="Fetching Data.."
          onClick={handleSubmitBtnClicked}
          colorScheme={"purple"}
        >
          Ask
        </Button>
        <Button mt={4} mx={4} onClick={handleClearBtnClicked}>
          Clear
        </Button>

        {response === "" ? null : (
          <Box mt={4}>
            <Heading fontSize={"md"}>Response</Heading>
            <Text mt={2}>{response}</Text>
          </Box>
        )}
      </Box>
    </Flex>
  );
}

export default App;
