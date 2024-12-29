import axios from 'axios';
import { AbiItem } from 'web3-utils';

const GITHUB_RAW_BASE_URL =
  'https://raw.githubusercontent.com/coin100-dao/.github/main';

export interface ContractAddresses {
  c100TokenAddress: string;
  publicSaleAddress: string;
}

export const fetchContractABI = async (
  contractType: 'c100' | 'public-sale'
): Promise<AbiItem[]> => {
  try {
    const fileName =
      contractType === 'c100' ? 'c100-abi.json' : 'c100-public-sale-abi.json';

    const response = await axios.get<string>(
      `${GITHUB_RAW_BASE_URL}/${fileName}`,
      {
        transformResponse: [(data) => data],
      }
    );

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

interface AddressesResponse {
  coin100: string;
  coin100_public_sale: string;
}

export const fetchContractAddresses = async (): Promise<ContractAddresses> => {
  try {
    const url = `${GITHUB_RAW_BASE_URL}/addresses`;

    const response = await axios.get<AddressesResponse>(url);
    const data = response.data;

    if (!data.coin100 || !data.coin100_public_sale) {
      throw new Error('Required contract addresses not found');
    }

    const addresses = {
      c100TokenAddress: data.coin100,
      publicSaleAddress: data.coin100_public_sale,
    };

    return addresses;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching addresses:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
    }
    console.error('Error fetching contract addresses:', error);
    throw error;
  }
};
