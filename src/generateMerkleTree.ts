import fs from 'fs';
import csv from 'csv-parser';
import MerkleTools from 'merkle-tools';

// Initialize Merkle Tools with SHA-256 as the hashing algorithm
const merkleTools = new MerkleTools({ hashType: 'sha256' });

// Function to read eligible users from CSV
const readEligibleUsers = (csvFilePath: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const eligibleUsers: string[] = [];
    
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.address && typeof row.address === 'string') {
          eligibleUsers.push(row.address.trim());
        } else {
          console.error('Invalid row:', row);
        }
      })
      .on('end', () => {
        resolve(eligibleUsers);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Function to generate Merkle Tree and save results to a file
const generateMerkleTree = async (csvFilePath: string) => {
  try {
    const eligibleUsers = await readEligibleUsers(csvFilePath);

    if (eligibleUsers.length === 0) {
      throw new Error('No valid addresses found in the CSV file');
    }

    // Add each eligible user to the Merkle Tree
    eligibleUsers.forEach((user) => {
      merkleTools.addLeaf(user, true);
    });

    // Build the Merkle Tree
    merkleTools.makeTree();

    // Get the Merkle Root
    const merkleRoot = merkleTools.getMerkleRoot();
    if (!merkleRoot) {
      throw new Error('Merkle Root is null. Make sure the tree has been built.');
    }
    console.log('Merkle Root:', merkleRoot.toString('hex'));

    // Generate proofs for each user and save them
    const proofs = eligibleUsers.map((user, index) => ({
      address: user,
      proof: merkleTools.getProof(index),
    }));

    // Save the Merkle Root and proofs to a JSON file
    const result = {
      merkleRoot: merkleRoot.toString('hex'),
      proofs,
    };

    fs.writeFileSync('merkleData.json', JSON.stringify(result, null, 2));
    console.log('Merkle data saved to merkleData.json');

  } catch (error) {
    console.error('Error generating Merkle Tree:', error);
  }
};

// Run the function to generate Merkle Tree from the CSV file
generateMerkleTree('eligible-users.csv');
