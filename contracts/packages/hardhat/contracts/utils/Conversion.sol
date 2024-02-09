//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";

library Conversion {
    error InvalidAuthenticatorData();
    error InvalidClientData();

    function convertInputs(bytes32 message, bytes32 _hash) internal pure returns (bytes32 [] memory){
        bytes32[] memory byte32Inputs = new bytes32[](33);

        for (uint256 i = 0; i < 32; i++) {
            byte32Inputs[i] = convertToPaddedByte32(message[i]);
        }

        byte32Inputs[32] = _hash;

        return byte32Inputs;
    }

    function convertPasskeyInputs(bytes32 pubkeyx, bytes32 pubkeyy, bytes32 message) internal pure returns (bytes32 [] memory){
        bytes32[] memory byte32Inputs = new bytes32[](96);

        for (uint256 i = 0; i < 32; i++) {
            byte32Inputs[i] = convertToPaddedByte32(pubkeyx[i]);
            byte32Inputs[i + 32] = convertToPaddedByte32(pubkeyy[i]);
            byte32Inputs[i + 64] = convertToPaddedByte32(message[i]);
        }

        return byte32Inputs;
    }

    function getPasskeyMessage(uint256 _nonce) internal pure returns (string memory) {
        bytes32 hash = sha256(abi.encodePacked(_nonce));
        return Strings.toHexString(uint256(hash), 32);
    }

    function convertToPaddedByte32(bytes32 value) internal pure returns (bytes32) {
        bytes32 paddedValue;
        paddedValue = bytes32(uint256(value) >> (31 * 8));
        return paddedValue;
    } 

    function hashMessage(string memory message) internal pure returns (bytes32) {
        string memory messagePrefix = "\x19Ethereum Signed Message:\n";

        string memory lengthString = Strings.toString(bytes(message).length);

        string memory concatenatedMessage = string(abi.encodePacked(messagePrefix, lengthString, message));

        return keccak256(bytes(concatenatedMessage));
    }

     function decodeEncodedInputs(
        bytes memory _inputs
    )
        internal
        pure
        returns (bytes32, bytes32, string memory)
    {
        (
            bytes32 pubkeyx,
            bytes32 pubkeyy,
            string memory credentialId
        ) = abi.decode(_inputs, (bytes32, bytes32, string));

        return (
            pubkeyx,
            pubkeyy,
            credentialId
        );
    }

    function computeMessage(
        bytes memory authenticatorData,
        bytes1 authenticatorDataFlagMask,
        bytes memory clientData,
        string memory clientChallenge,
        uint clientChallengeDataOffset
    ) internal pure returns (bytes32) {
        if (
            (authenticatorData[32] & authenticatorDataFlagMask) !=
            authenticatorDataFlagMask
        ) {
            revert InvalidAuthenticatorData();
        }

        bytes memory challengeExtracted = new bytes(
            bytes(clientChallenge).length
        );

        copyBytes(
            clientData,
            clientChallengeDataOffset,
            challengeExtracted.length,
            challengeExtracted,
            0
        );

        if (
            keccak256(abi.encodePacked(bytes(clientChallenge))) !=
            keccak256(abi.encodePacked(challengeExtracted))
        ) {
            revert InvalidClientData();
        }

        bytes memory verifyData = new bytes(authenticatorData.length + 32);

        copyBytes(
            authenticatorData,
            0,
            authenticatorData.length,
            verifyData,
            0
        );

        copyBytes(
            abi.encodePacked(sha256(clientData)),
            0,
            32,
            verifyData,
            authenticatorData.length
        );

        return (sha256(verifyData));
    }

    function copyBytes(
        bytes memory _from,
        uint _fromOffset,
        uint _length,
        bytes memory _to,
        uint _toOffset
    ) internal pure returns (bytes memory _copiedBytes) {
        uint minLength = _length + _toOffset;
        require(_to.length >= minLength);
        uint i = 32 + _fromOffset; 
        uint j = 32 + _toOffset;
        while (i < (32 + _fromOffset + _length)) {
            assembly {
                let tmp := mload(add(_from, i))
                mstore(add(_to, j), tmp)
            }
            i += 32;
            j += 32;
        }
        return _to;
    }
}