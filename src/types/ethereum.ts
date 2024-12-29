export interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (params?: unknown) => void) => void;
  removeListener: (event: string, callback: (params?: unknown) => void) => void;
  selectedAddress?: string;
  chainId?: string;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
