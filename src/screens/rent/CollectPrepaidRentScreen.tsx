import type { Shop } from "../../types/shop";
import { RentCollectionScreen } from "./RentCollectionScreen";

export function CollectPrepaidRentScreen({ shop }: { shop: Shop }) {
  return <RentCollectionScreen key={shop.id} shop={shop} />;
}
