export interface GuestCreateInput {
  id_customer: number;
  id_operating_system?: number;
  id_web_browser?: number;
  javascript?: boolean;
  screen_resolution_x?: number;
  screen_resolution_y?: number;
  screen_color?: number;
  sun_java?: boolean;
  adobe_flash?: boolean;
  adobe_director?: boolean;
  apple_quicktime?: boolean;
  real_player?: boolean;
  windows_media?: boolean;
  accept_language?: string;
  mobile_theme?: boolean;
}

export type GuestUpdateInput = GuestCreateInput;

export interface GuestOutput {
  id: number;
  id_customer: number;
  id_operating_system: number | null;
  id_web_browser: number | null;
  javascript: boolean;
  screen_resolution_x: number | null;
  screen_resolution_y: number | null;
  screen_color: number | null;
  sun_java: boolean;
  adobe_flash: boolean;
  adobe_director: boolean;
  apple_quicktime: boolean;
  real_player: boolean;
  windows_media: boolean;
  accept_language: string;
  mobile_theme: boolean;
}

export interface GuestListItem {
  id: number;
  href: string;
}
