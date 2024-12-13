import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const Home = () => {
  const [cookies, removeCookie] = useCookies([]);
  const [user, setUser] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const verifyCookie = async () => {
      if (!cookies.token) {
        window.location.href = "http://localhost:3000/login";
      }
      const { data } = await axios.get(
        "http://localhost:3002/user",
        { withCredentials: true }
      );
      // console.log(data)
      setUser(data);
      return data
        ? toast(`Hello ${data?.username}, Welcome to your Dashboard`, {
            position: "top-right",
          })
        : (removeCookie("token"), window.location.href = "http://localhost:3000/login");
    };
    verifyCookie();
  }, []);

  return (
    <>
      <TopBar user={user}/>
      <Dashboard user={user}/>
      <ToastContainer/>
    </>
  );
};

export default Home;
