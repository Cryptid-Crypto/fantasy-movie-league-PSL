import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { 
  createMovie, 
  updateMovie, 
  deleteMovie,
  createScene,
  updateScene,
  deleteScene,
  addScenePerformer,
  removeScenePerformer,
  addScenePerformerAction,
  removeScenePerformerAction,
  createPerformer,
  updatePerformer,
  deletePerformer,
  getAllMovies,
  getScenesByMovieId,
  getScenePerformers,
  getScenePerformerActionsList
} from "../db";

// Middleware to check if user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Admin access required'
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // Movie management
  movies: router({
    list: adminProcedure.query(async () => {
      return await getAllMovies();
    }),

    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        releaseDate: z.string(),
        studio: z.string().optional(),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { releaseDate, ...rest } = input;
        return await createMovie({
          ...rest,
          releaseDate: new Date(releaseDate),
        });
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        releaseDate: z.string().optional(),
        studio: z.string().optional(),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, releaseDate, ...data } = input;
        return await updateMovie(id, {
          ...data,
          ...(releaseDate ? { releaseDate: new Date(releaseDate) } : {}),
        });
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteMovie(input.id);
        return { success: true };
      }),
  }),

  // Scene management
  scenes: router({
    listByMovie: adminProcedure
      .input(z.object({ movieId: z.number() }))
      .query(async ({ input }) => {
        return await getScenesByMovieId(input.movieId);
      }),

    create: adminProcedure
      .input(z.object({
        movieId: z.number(),
        sceneNumber: z.number(),
        title: z.string().optional(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createScene(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        sceneNumber: z.number().optional(),
        title: z.string().optional(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateScene(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteScene(input.id);
        return { success: true };
      }),

    // Scene performer management
    performers: router({
      list: adminProcedure
        .input(z.object({ sceneId: z.number() }))
        .query(async ({ input }) => {
          return await getScenePerformers(input.sceneId);
        }),

      add: adminProcedure
        .input(z.object({
          sceneId: z.number(),
          performerId: z.number(),
        }))
        .mutation(async ({ input }) => {
          return await addScenePerformer(input.sceneId, input.performerId);
        }),

      remove: adminProcedure
        .input(z.object({
          sceneId: z.number(),
          performerId: z.number(),
        }))
        .mutation(async ({ input }) => {
          await removeScenePerformer(input.sceneId, input.performerId);
          return { success: true };
        }),

      // Actions for scene performers
      actions: router({
        list: adminProcedure
          .input(z.object({ 
            sceneId: z.number(),
            performerId: z.number()
          }))
          .query(async ({ input }) => {
            return await getScenePerformerActionsList(input.sceneId, input.performerId);
          }),

        add: adminProcedure
          .input(z.object({
            sceneId: z.number(),
            performerId: z.number(),
            actionId: z.number(),
          }))
          .mutation(async ({ input }) => {
            return await addScenePerformerAction(
              input.sceneId,
              input.performerId,
              input.actionId
            );
          }),

        remove: adminProcedure
          .input(z.object({
            sceneId: z.number(),
            performerId: z.number(),
            actionId: z.number(),
          }))
          .mutation(async ({ input }) => {
            await removeScenePerformerAction(
              input.sceneId,
              input.performerId,
              input.actionId
            );
            return { success: true };
          }),
      }),
    }),
  }),

  // Performer management
  performers: router({
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        performerType: z.enum(['Legend', 'Anal Queen', 'Super Slut', 'Extreme', 'Girl Next Door', 'Rising Star', 'Hall of Fame', 'Specialist']),
        bio: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createPerformer(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        performerType: z.enum(['Legend', 'Anal Queen', 'Super Slut', 'Extreme', 'Girl Next Door', 'Rising Star', 'Hall of Fame', 'Specialist']).optional(),
        bio: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updatePerformer(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePerformer(input.id);
        return { success: true };
      }),
  }),
});
