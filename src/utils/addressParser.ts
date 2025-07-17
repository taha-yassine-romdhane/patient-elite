import { getDelegationsForRegion } from './tunisianRegions';

/**
 * Parse an address string to extract delegation and additional address details
 * Format expected: "Delegation, Additional details" or just "Delegation"
 */
export function parseAddress(address: string, region: string): { delegation: string; addressDetails: string } {
  // Get all possible delegations for this region
  const possibleDelegations = getDelegationsForRegion(region);
  
  // Default values
  let delegation = '';
  let addressDetails = '';
  
  // If there's a comma, split by the first comma
  if (address.includes(',')) {
    const [firstPart, ...rest] = address.split(',');
    const potentialDelegation = firstPart.trim();
    
    // Check if the first part is a valid delegation for this region
    if (possibleDelegations.includes(potentialDelegation)) {
      delegation = potentialDelegation;
      addressDetails = rest.join(',').trim();
    } else {
      // If not a valid delegation, try to find one in the address
      const foundDelegation = possibleDelegations.find(d => address.includes(d));
      if (foundDelegation) {
        delegation = foundDelegation;
        // Remove the delegation from the address to get the details
        addressDetails = address.replace(foundDelegation, '').replace(/^,\s*/, '').trim();
      } else {
        // If no delegation found, use the first part as delegation
        delegation = potentialDelegation;
        addressDetails = rest.join(',').trim();
      }
    }
  } else {
    // No comma, check if the entire address is a delegation
    if (possibleDelegations.includes(address.trim())) {
      delegation = address.trim();
    } else {
      // Try to find a delegation in the address
      const foundDelegation = possibleDelegations.find(d => address.includes(d));
      if (foundDelegation) {
        delegation = foundDelegation;
        // Remove the delegation from the address to get the details
        addressDetails = address.replace(foundDelegation, '').trim();
      } else {
        // If no delegation found, use the entire address as delegation
        delegation = address.trim();
      }
    }
  }
  
  return { delegation, addressDetails };
}

/**
 * Format delegation and address details into a single address string
 */
export function formatAddress(delegation: string, addressDetails?: string): string {
  if (!addressDetails) return delegation;
  return `${delegation}, ${addressDetails}`;
}
