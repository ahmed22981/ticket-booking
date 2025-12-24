import express from "express";
import {getNowPlayingMovies} from "../controllers/show.Controller";

const router = express.Router();

router.get("/now-playing", getNowPlayingMovies);

export default router;
