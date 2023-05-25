import { NearBindgen, initialize, call, near, view, LookupMap, Vector, assert } from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";
import { Item, ItemStatus } from "./models";

@NearBindgen({})
class BOSCommerce {
  contract_account: AccountId = "";
  account_ids: Vector<string> = new Vector<string>("account_ids");
  item_ids: Vector<string> = new Vector<string>("item_ids");
  accounts_items: LookupMap<Array<string>> = new LookupMap<Array<string>>("accounts_items");
  items: LookupMap<Item> = new LookupMap<Item>("items");

  @initialize({})
  init() {
    this.contract_account = near.predecessorAccountId();
  }

  @call({ payableFunction: true })
  create_item({ name, description, image }: { name: string; description: string; image: string }): object {
    assert(name != "", "Name cannot be empty");
    assert(description != "", "Description cannot be empty");
    assert(image != "", "Image cannot be empty");
    const item_id = this.item_ids.length.toString();
    const item = new Item();
    item.id = item_id;
    item.name = name;
    item.description = description;
    item.image = image;
    item.owner = near.predecessorAccountId();
    item.created_at = Date.now().toString();
    item.updated_at = Date.now().toString();
    item.status = ItemStatus.CREATED;
    this.item_ids.push(item_id);
    this.items.set(item_id, item);
    const account_items = this.accounts_items.get(item.owner);
    if (account_items) {
      account_items.push(item_id);
      this.accounts_items.set(item.owner, account_items);
    } else {
      this.account_ids.push(item.owner);
      this.accounts_items.set(item.owner, [item_id]);
    }

    return { success: true, msg: "Item created successfully", item_id: item_id };
  }

  @view({})
  get_items(): Array<Item> {
    const item_ids = this.item_ids.toArray();
    const items: Item[] = [];
    for (const item_id of item_ids) {
      const item = this.items.get(item_id);
      if (item) {
        items.push(item);
      }
    }

    return items;
  }
}
