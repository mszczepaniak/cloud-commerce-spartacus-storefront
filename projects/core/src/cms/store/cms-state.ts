import { NodeItem } from '../model/node-item.model';
import { Page } from '../model/page.model';

export const CMS_FEATURE = 'cms';

export interface ComponentState {
  entities: { [id: string]: any };
}

export interface NavigationItemState {
  nodes: { [nodeId: string]: NodeItem };
}

export interface PageState {
  entities: { [context: string]: Page };
  count: number;
  latestPageKey: string;
}
