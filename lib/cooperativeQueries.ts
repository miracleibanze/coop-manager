import { Types } from "mongoose";

// Helper to build cooperative-scoped queries
export function withCooperative<T>(
  cooperativeId: string | Types.ObjectId,
  additionalFilters: any = {}
) {
  return {
    cooperativeId: new Types.ObjectId(cooperativeId),
    ...additionalFilters,
  };
}

// Common population options
export const cooperativePopulate = {
  path: "cooperativeId",
  select: "name description",
};

export const memberPopulate = {
  path: "member",
  select: "name email phone",
};
