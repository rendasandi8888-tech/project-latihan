import { getContract, readContract } from 'thirdweb'
import { client, monadTestnet } from './client'

const USER_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_USER_REGISTRY_ADDRESS!

const userRegistryContract = getContract({
  client,
  chain: monadTestnet,
  address: USER_REGISTRY_ADDRESS,
})

/**
 * getUserRole — query role wallet langsung dari smart contract UserRegistry.
 * Return: 0=UNREGISTERED, 1=ADMIN, 2=DOCTOR, 3=STAFF, 4=PATIENT
 */
export async function getUserRole(address: string): Promise<number> {
  try {
    const role = await readContract({
      contract: userRegistryContract,
      method: 'function getRole(address userAddress) view returns (uint8)',
      params: [address],
    })
    return Number(role)
  } catch (error) {
    console.error('Error fetching user role from blockchain:', error)
    return 0
  }
}

export async function getUserProfile(address: string) {
  try {
    const result = await readContract({
      contract: userRegistryContract,
      method:
        'function getUser(address userAddress) view returns (address walletAddress, uint8 role, string name, string department, uint256 registeredAt, bool isActive, address registeredBy)',
      params: [address],
    })
    const [walletAddress, role, name, department, registeredAt, isActive, registeredBy] = result
    return {
      address: walletAddress,
      role: Number(role),
      name,
      department,
      registeredAt: Number(registeredAt),
      isActive,
      registeredBy,
    }
  } catch (error) {
    console.error('Error fetching user profile from blockchain:', error)
    return null
  }
}