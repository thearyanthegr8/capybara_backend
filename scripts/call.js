function contract_init(contract_address) {
    const hre = require("hardhat");
    const ContractJson = require("../artifacts/contracts/Prescription.sol/Prescription.json");
    const abi = ContractJson.abi;

    const alchemy = new hre.ethers.providers.AlchemyProvider(
        'maticmum',
        process.env.ALCHEMY_API_KEY
    );
    const userWallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, alchemy);

    const Contract = new hre.ethers.Contract(
        contract_address,
        abi,
        userWallet
    )
    return Contract;
}


async function is_valid(address){
    const Contract = contract_init(address);
    const x = await Contract.isValid();
    console.log(x);
    return x;
}

async function verify_prescription(address, hash){
    const Contract = contract_init(address);
    const x = await Contract.verifyPrescription(hash);
    console.log(x);
    return x;
}

async function use_prescription(address, hash){
    const Contract = contract_init(address);
    
    const prescription_state = await is_valid(address);
    const hash_state = await verify_prescription(address, hash);

    if (prescription_state && hash_state){
        const x = await Contract.usePrescription();
        console.log("Done");
        return true;
    }else{
        console.log("Invalid Prescription");
        return false;
    }
}

module.exports = {
    is_valid,
    use_prescription,
    verify_prescription
}

// use_prescription("0x2C2a688D6c6ceDAbA580Fef2485927a74163ECAC", "lol")
//     .then(() => process.exit(0))
//     .catch((error) => {
//         console.log("OH NO!");
//         console.error(error);
//         process.exit(1);
// });