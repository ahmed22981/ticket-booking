import {createContext, useContext, useEffect, useState} from "react";
import axios from "axios";
import {useAuth, useUser} from "@clerk/clerk-react";
import {useLocation, useNavigate} from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

export const AppProvider = ({children}) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const {user, isLoaded} = useUser();
  const {getToken} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchIsAdmin = async () => {
    if (!user) {
      setIsCheckingAdmin(false);
      return;
    }

    setIsCheckingAdmin(true);
    try {
      const token = await getToken();
      const {data} = await axios.get("/api/admin/is-admin", {
        headers: {Authorization: `Bearer ${token}`},
      });

      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("You are not authorized to access admin dashboard");
      }
    } catch (error) {
      console.error(error);
      setIsAdmin(false);
      if (location.pathname.startsWith("/admin")) {
        navigate("/");
      }
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  const fetchShows = async () => {
    try {
      const {data} = await axios.get("/api/show/all");

      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message || "Failed to fetch shows");
      }
    } catch (error) {
      console.error("Error fetching shows:", error);
      toast.error("Error loading shows");
    }
  };

  const fetchFavoriteMovies = async () => {
    if (!user) return;

    try {
      const token = await getToken();
      const {data} = await axios.get("/api/user/favorites", {
        headers: {Authorization: `Bearer ${token}`},
      });

      if (data.success) {
        setFavoriteMovies(data.favorites || []);
      } else {
        if (data.message) toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        fetchIsAdmin();
        fetchFavoriteMovies();
      } else {
        setIsCheckingAdmin(false);
        setFavoriteMovies([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoaded, location.pathname]);

  const value = {
    axios,
    fetchIsAdmin,
    user,
    getToken,
    navigate,
    isAdmin,
    isCheckingAdmin,
    shows,
    favoriteMovies,
    fetchFavoriteMovies,
    image_base_url,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);
