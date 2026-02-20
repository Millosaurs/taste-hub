import type { RouterClient } from "@orpc/server";

import { usersRouter } from "./users";
import { dishesRouter } from "./dishes";
import { profilesRouter } from "./profiles";
import { feedbackRouter } from "./feedback";
import { publicProcedure } from "../index";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  users: usersRouter,
  dishes: dishesRouter,
  profiles: profilesRouter,
  feedback: feedbackRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
