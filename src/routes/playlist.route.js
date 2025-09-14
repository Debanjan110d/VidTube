import { Router } from "express";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const playlistRouter = Router();

// Public routes
playlistRouter.route("/user/:userId").get(getUserPlaylists);
playlistRouter.route("/:playlistId").get(getPlaylistById);

// Protected routes
playlistRouter.use(verifyJWT);

playlistRouter.route("/").post(createPlaylist);

playlistRouter
    .route("/:playlistId")
    .patch(updatePlaylist)
    .delete(deletePlaylist);

playlistRouter.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
playlistRouter.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

export default playlistRouter;