import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateWallet: protectedProcedure
      .input(z.object({ walletAddress: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserWallet(ctx.user.id, input.walletAddress);
        return { success: true };
      }),
  }),

  // Admin routers
  admin: router({
    // Performer management
    performers: router({
      list: adminProcedure.query(async () => {
        return db.getAllPerformers();
      }),
      create: adminProcedure
        .input(z.object({
          name: z.string().min(1, "Performer name is required"),
          bio: z.string().optional(),
          imageUrl: z.string().optional(),
          nftContractAddress: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const id = await db.createPerformer(input);
          const performer = await db.getPerformerById(id);
          if (!performer) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create performer' });
          }
          return performer;
        }),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          bio: z.string().optional(),
          imageUrl: z.string().optional(),
          nftContractAddress: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await db.updatePerformer(id, data);
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deletePerformer(input.id);
          return { success: true };
        }),
    }),

    // Movie management
    movies: router({
      list: adminProcedure.query(async () => {
        return db.getAllMovies();
      }),
      getById: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return db.getMovieById(input.id);
        }),
      create: adminProcedure
        .input(z.object({
          title: z.string(),
          releaseDate: z.date().optional(),
          coverImageUrl: z.string().optional(),
          description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const id = await db.createMovie(input);
          return { id };
        }),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          title: z.string().optional(),
          releaseDate: z.date().optional(),
          coverImageUrl: z.string().optional(),
          description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await db.updateMovie(id, data);
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteMovie(input.id);
          return { success: true };
        }),
      addPerformer: adminProcedure
        .input(z.object({ movieId: z.number(), performerId: z.number() }))
        .mutation(async ({ input }) => {
          const id = await db.addPerformerToMovie(input.movieId, input.performerId);
          return { id };
        }),
      removePerformer: adminProcedure
        .input(z.object({ movieId: z.number(), performerId: z.number() }))
        .mutation(async ({ input }) => {
          await db.removePerformerFromMovie(input.movieId, input.performerId);
          return { success: true };
        }),
      getPerformers: adminProcedure
        .input(z.object({ movieId: z.number() }))
        .query(async ({ input }) => {
          return db.getPerformersByMovieId(input.movieId);
        }),
    }),

    // Scene management
    scenes: router({
      listByMovie: adminProcedure
        .input(z.object({ movieId: z.number() }))
        .query(async ({ input }) => {
          return db.getScenesByMovieId(input.movieId);
        }),
      create: adminProcedure
        .input(z.object({
          movieId: z.number(),
          title: z.string().optional(),
          sceneNumber: z.number().optional(),
          duration: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const id = await db.createScene(input);
          return { id };
        }),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          title: z.string().optional(),
          sceneNumber: z.number().optional(),
          duration: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await db.updateScene(id, data);
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteScene(input.id);
          return { success: true };
        }),
    }),

    // Action management
    actions: router({
      list: adminProcedure.query(async () => {
        return db.getAllActions();
      }),
      create: adminProcedure
        .input(z.object({
          name: z.string(),
          points: z.number(),
          description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const id = await db.createAction(input);
          return { id };
        }),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          points: z.number().optional(),
          description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await db.updateAction(id, data);
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteAction(input.id);
          return { success: true };
        }),
    }),

    // Scene performer action logging
    sceneActions: router({
      list: adminProcedure
        .input(z.object({ sceneId: z.number() }))
        .query(async ({ input }) => {
          return db.getScenePerformerActions(input.sceneId);
        }),
      log: adminProcedure
        .input(z.object({
          sceneId: z.number(),
          performerId: z.number(),
          actionId: z.number(),
        }))
        .mutation(async ({ input }) => {
          const id = await db.logScenePerformerAction(input);
          return { id };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteScenePerformerAction(input.id);
          return { success: true };
        }),
    }),

    // Tournament management
    tournaments: router({
      list: adminProcedure.query(async () => {
        return db.getAllTournaments();
      }),
      create: adminProcedure
        .input(z.object({
          name: z.string(),
          description: z.string().optional(),
          startDate: z.date(),
          endDate: z.date(),
          requiredNftContractAddress: z.string().optional(),
          entryFee: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const id = await db.createTournament(input);
          return { id };
        }),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          requiredNftContractAddress: z.string().optional(),
          entryFee: z.string().optional(),
          status: z.enum(['upcoming', 'active', 'completed']).optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await db.updateTournament(id, data);
          return { success: true };
        }),
      calculateScores: adminProcedure
        .input(z.object({ tournamentId: z.number() }))
        .mutation(async ({ input }) => {
          await db.calculateTournamentScores(input.tournamentId);
          return { success: true };
        }),
    }),
  }),

  // Public routers
  performers: router({
    list: publicProcedure.query(async () => {
      return db.getAllPerformers();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const performer = await db.getPerformerById(input.id);
        if (!performer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Performer not found' });
        }
        return performer;
      }),
    getRecentPerformances: publicProcedure
      .input(z.object({ performerId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getPerformerRecentPerformances(input.performerId, input.limit);
      }),
  }),

  tournaments: router({
    list: publicProcedure.query(async () => {
      return db.getAllTournaments();
    }),
    getActive: publicProcedure.query(async () => {
      return db.getActiveTournaments();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const tournament = await db.getTournamentById(input.id);
        if (!tournament) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Tournament not found' });
        }
        return tournament;
      }),
    getLeaderboard: publicProcedure
      .input(z.object({ tournamentId: z.number() }))
      .query(async ({ input }) => {
        return db.getTournamentEntries(input.tournamentId);
      }),
    enter: protectedProcedure
      .input(z.object({
        tournamentId: z.number(),
        performerId: z.number(),
        nftTokenId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user already entered
        const existing = await db.getUserTournamentEntry(input.tournamentId, ctx.user.id);
        if (existing) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already entered this tournament' });
        }
        
        const id = await db.enterTournament({
          ...input,
          userId: ctx.user.id,
          totalScore: 0,
        });
        return { id };
      }),
  }),

  nfts: router({
    sync: protectedProcedure
      .input(z.object({
        nfts: z.array(z.object({
          performerId: z.number(),
          contractAddress: z.string(),
          tokenId: z.string(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        // Clear existing NFTs
        await db.clearUserNfts(ctx.user.id);
        
        // Sync new NFTs
        for (const nft of input.nfts) {
          await db.syncUserNft({
            userId: ctx.user.id,
            ...nft,
            lastSyncedAt: new Date(),
          });
        }
        
        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserNfts(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
