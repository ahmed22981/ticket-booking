import React from "react";
import {Route, Routes, useLocation} from "react-router-dom";
import {SignIn} from "@clerk/clerk-react";
import {Toaster} from "react-hot-toast";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
// Loading
import Loading from "./components/Loading";

// Pages (Public)
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import SeatLayout from "./pages/SeatLayout";
import MyBookings from "./pages/MyBookings";
import Favorite from "./pages/Favorite";

// Pages (Admin)
import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import AddShows from "./pages/admin/AddShows";
import ListShows from "./pages/admin/ListShows";
import ListBookings from "./pages/admin/ListBookings";

// Context
import {useAppContext} from "./context/AppContext";

const App = () => {
  // Check if the current route is an admin route to conditionally render Navbar/Footer
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Destructure state from context.
  // ensure you have added 'isCheckingAdmin' to your AppContext provider value as discussed.
  const {user, isCheckingAdmin, isAdmin} = useAppContext();

  return (
    <>
      {/* Toast Configuration:
         Added zIndex: 9999 to ensure the toast appears ON TOP of the Navbar and everything else.
      */}
      <Toaster position="top-center" toastOptions={{style: {zIndex: 9999}}} />

      {/* Only show Navbar if we are NOT in the admin dashboard */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* ================= Public Routes ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/loading/:nextUrl" element={<Loading />} />
        <Route path="/favorites" element={<Favorite />} />

        {/* ================= Admin Routes ================= */}
        <Route
          path="/admin/*"
          element={
            // 1. If not logged in -> Show Clerk Sign In
            !user ? (
              <div className="min-h-screen flex justify-center items-center">
                <SignIn fallbackRedirectUrl={"/admin"} />
              </div>
            ) : // 2. If logged in but still checking DB for admin status -> Show Loading
            // This prevents the "Flash" of the admin dashboard for non-admins
            isCheckingAdmin ? (
              <div className="min-h-screen flex justify-center items-center">
                <p className="text-xl text-gray-600">
                  Verifying Admin Privileges...
                </p>
              </div>
            ) : // 3. If checking is done and user IS admin -> Show Admin Layout
            isAdmin ? (
              <Layout />
            ) : (
              // 4. If checking is done and user is NOT admin -> Show nothing
              // The AppContext will handle the redirect to Home and show the error Toast
              <div className="min-h-screen"></div>
            )
          }
        >
          {/* Nested Admin Routes */}
          <Route index element={<Dashboard />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
        </Route>
      </Routes>

      {/* Only show Footer if we are NOT in the admin dashboard */}
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
