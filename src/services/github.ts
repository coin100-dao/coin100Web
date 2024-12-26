import axios from 'axios';

const GITHUB_RAW_BASE_URL =
  'https://raw.githubusercontent.com/coin100-dao/coin100Web3/master';

export const fetchContractABI = async (
  contractType: 'c100' | 'public-sale'
) => {
  const fileName =
    contractType === 'c100' ? 'c100-abi.json' : 'c100-public-sale-abi.json';
  const response = await axios.get(
    `${GITHUB_RAW_BASE_URL}/contract-abi/${fileName}`
  );
  return response.data;
};

export const fetchContractAddresses = async () => {
  const response = await axios.get(`${GITHUB_RAW_BASE_URL}/addresses`);
  return response.data;
};
