
export enum GameState {
  IDLE = 'IDLE',
  SHUFFLING = 'SHUFFLING',
  SCRATCHING = 'SCRATCHING',
  REVEALED = 'REVEALED'
}

export interface WinnerData {
  name: string;
  fortune: string;
}
