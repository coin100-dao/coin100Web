import axios from 'axios';
import { AbiItem } from 'web3-utils';

const GITHUB_RAW_BASE_URL =
  'https://raw.githubusercontent.com/coin100-dao/.github/main';

interface ContractAddresses {
  c100TokenAddress: string;
  publicSaleAddress: string;
}

export const fetchContractABI = async (
  contractType: 'c100' | 'public-sale'
): Promise<AbiItem[]> => {
  try {
    const fileName =
      contractType === 'c100' ? 'c100-abi.json' : 'c100-public-sale-abi.json';
    const response = await axios.get(`${GITHUB_RAW_BASE_URL}/${fileName}`, {
      transformResponse: [(data) => data],
    });

    const parsedData = JSON.parse(response.data);
    if (!Array.isArray(parsedData)) {
      throw new Error(`Invalid ABI format for ${contractType}`);
    }
    return parsedData;
  } catch (error) {
    console.error(`Error fetching ${contractType} ABI:`, error);
    throw error;
  }
};

export const fetchContractAddresses = async (): Promise<ContractAddresses> => {
  try {
    const response = await axios.get(`${GITHUB_RAW_BASE_URL}/addresses`);
    const data = response.data;

    if (!data.coin100 || !data.coin100_public_sale) {
      throw new Error('Required contract addresses not found');
    }

    return {
      c100TokenAddress: data.coin100,
      publicSaleAddress: data.coin100_public_sale,
    };
  } catch (error) {
    console.error('Error fetching contract addresses:', error);
    throw error;
  }
};
