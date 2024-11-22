const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const { ethers } = require("ethers");

// Asyncronous function wrapper in the event an API call fails
async function retryApiCall(
  apiCall,
  maxRetries = 5,
  delayBetweenRetries = 1000
) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      console.error(`API call failed: ${error.message}`);
      retries++;
      if (retries < maxRetries) {
        console.log(`Retrying API call (${retries}/${maxRetries})...`);
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenRetries)
        );
      } else {
        console.error("Max retries reached, giving up.");
        throw error;
      }
    }
  }
  return;
}

// Accessing Google Secrets
async function accessSecret(secretName) {
  const client = new SecretManagerServiceClient();

  try {
    const name = client.secretVersionPath("ethrhub", secretName, "latest");
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload.data.toString("utf8");
    return payload;
  } catch (error) {
    console.error("Error accessing secret:", error);
    throw error;
  }
}

// Verifying a signature from the front-end on the back-end
function verifySignature(message, signature, address) {
  const signerAddress = ethers.utils.verifyMessage(message, signature);
  return signerAddress.toLowerCase() === address.toLowerCase();
}

// Querying Infura node to match Ethereum address to ENS name
async function checkEnsName(address) {
  const INFURA_URI = await retryApiCall(() => accessSecret("INFURA_URI"));
  console.log(ethers);
  const provider = new ethers.providers.JsonRpcProvider(INFURA_URI);
  try {
    const ensName = await provider.lookupAddress(address);

    if (ensName) {
      console.log(
        `The address ${address} resolves to the ENS name: ${ensName}`
      );
    } else {
      console.log(
        `The address ${address} does not have an associated ENS name`
      );
    }
    return ensName;
  } catch (error) {
    console.error("Error performing reverse lookup:", error);
  }
}

module.exports = { retryApiCall, accessSecret, verifySignature, checkEnsName };
