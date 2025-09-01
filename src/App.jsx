import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

import Home from "./Component/Home/Home";
import SignIn from "./Component/SignIn/SignIn";
import Register from "./Component/Register/Register";
import HeroSection from "./Component/Home/HeroSection";
import Service from "./Component/Services/Service";
import About from "./Component/About/About";
import Contact from "./Component/Contact/Contact";
import UserDashboard from "./Component/UserDashboard/UserDashboard";
import AdminDashboard from "./Component/AdminDashboard/AdminDashboard";
import Map from "./Component/Map/MapLeaf";

import AdminLog from "./Component/AdminDashboard/AdminLog";
import AdminReg from "./Component/AdminDashboard/AdminReg";
import DisasterCard from "./Component/DisasterCard/DisasterCard";
import DisasterForm from "./Component/DisasterForm/DisasterForm";
import DisasterReport from "./Component/DisasterCard/DisasterReport";
import UpdateUser from "./Component/UserDashboard/UpdateUser";
import Emergency from "./Component/Emergency/Emergency";
import CommentSection from "./Component/DisasterCard/CommentSection";
import Settings from "./Component/Settings/Settings";
import DonationForm from "./Component/Help/DonationForm";
import AllReports from "./Component/DisasterCard/AllReports";
import DonationsList from "./Component/Help/DonationList";


// Notifications and Saved removed per request


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/hero" element={<HeroSection />} />
      <Route path="/service" element={<Service />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/map" element={<Map />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/update/:id" element={<UpdateUser />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/adminLog" element={<AdminLog />} />
      <Route path="/adminReg" element={<AdminReg />} />
      <Route path="/reports" element={<DisasterCard />} />
      <Route path="/disasters" element={<AllReports />} />
      <Route path="/disReport/:id" element={<DisasterReport />} />
      <Route path="/disForm" element={<DisasterForm />} />
      <Route path="/donate" element={<DonationForm />} />
      <Route path="/donation" element={<DonationsList />} />
      <Route path="/emergency" element={<Emergency />} />
      <Route path="/comment" element={<CommentSection />} />
      <Route path="/settings" element={<Settings />} />
      
      {/* <Route path="/profile" element={<Profile />} /> */}
    </Routes>
  );
}

export default App;
