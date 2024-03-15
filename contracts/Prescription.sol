// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Prescription {
    string private prescriptionId;
    string private prescriptionDataHash;
    bool private validPrescription;

    constructor(string memory _prescriptionId, string memory _prescriptionDataHash) {
        prescriptionId = _prescriptionId;
        prescriptionDataHash = _prescriptionDataHash;
        validPrescription = true;
    }

    function usePrescription() public {
    validPrescription = false;
    }


    function isValid() public view returns (bool) {
        return validPrescription;
    }

    function verifyPrescription(string memory _inputHash) public view returns (bool) {
        return keccak256(abi.encodePacked(_inputHash)) == keccak256(abi.encodePacked(prescriptionDataHash));
    }
}
