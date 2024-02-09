//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./Luna.sol";
import "./LunaStorage.sol";

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract LunaFactory is LunaStorage, ERC2771Context {
    Luna public immutable LUNA_IMPLEMENTATION;

    constructor(address _trustedForwarder, address _passkeyVerifier, address _recoveryVerifier) ERC2771Context(_trustedForwarder) {
        LUNA_IMPLEMENTATION = new Luna(_passkeyVerifier, _recoveryVerifier);
    }

    modifier onlyTrustedForwarder() {
        require(isTrustedForwarder(msg.sender), "LunaFactory: caller is not the trusted forwarder");
        _;
    }

    function createAccount(string memory name, bytes memory _passkeyInputs, bytes32 _recoveryHash, string memory _email, uint256 salt) external returns (Luna ret) { 
        if(LunaNameToDetails[name].isUsed) {
            ret = Luna(payable(LunaNameToDetails[name].walletAddress));
            return ret;
        }

        address addr = getAddress(name, _passkeyInputs, _recoveryHash, _email, salt);
        uint codeSize = addr.code.length;
        if (codeSize > 0) {
            return Luna(payable(addr));
        }
        ret = Luna(payable(new ERC1967Proxy{salt : bytes32(salt)}(
                address(LUNA_IMPLEMENTATION),
                abi.encodeCall(Luna.initialize, (name, _passkeyInputs, _recoveryHash, _email))
            )));
        addLuna(name, address(ret));
    }

    function getAddress(string memory name, bytes memory _passkeyInputs, bytes32 _recoveryHash, string memory _email, uint256 salt) public view returns (address) {
       return Create2.computeAddress(bytes32(salt), keccak256(abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(
                address(LUNA_IMPLEMENTATION),
                abi.encodeCall(Luna.initialize, (name, _passkeyInputs, _recoveryHash, _email))
            )
        )));
    }

      function executeLunaTx(string memory name, bytes calldata proof, bytes memory authenticatorData, bytes1 authenticatorDataFlagMask, bytes memory clientData, uint clientChallengeDataOffset, address dest, uint256 value, bytes calldata func) onlyTrustedForwarder isValidLuna(name) external returns (bool) {
        Luna luna = Luna(payable(address(LunaNameToDetails[name].walletAddress)));

        return luna.execute(proof, authenticatorData, authenticatorDataFlagMask, clientData, clientChallengeDataOffset, dest, value, func);
    }

    function executeLunaBatchTx(string memory name, bytes calldata proof, bytes memory authenticatorData, bytes1 authenticatorDataFlagMask, bytes memory clientData, uint clientChallengeDataOffset, address[] calldata dests, uint256[] calldata values, bytes[] calldata funcs) onlyTrustedForwarder isValidLuna(name) external returns (bool) {
        Luna luna = Luna(payable(address(LunaNameToDetails[name].walletAddress)));

        return luna.executeBatch(proof, authenticatorData, authenticatorDataFlagMask, clientData, clientChallengeDataOffset, dests, values, funcs);
    }

    function executeLunaPasskeyRecovery(string memory name, bytes calldata proof, bytes memory _passkeyInput) onlyTrustedForwarder isValidLuna(name) external returns (bool) {
        Luna luna = Luna(payable(address(LunaNameToDetails[name].walletAddress)));

        return luna.executePasskeyRecovery(proof, _passkeyInput);
    }

    function executeLunaChangeRecovery(string memory name, bytes calldata proof, bytes32 _recoveryHash, string memory email) onlyTrustedForwarder isValidLuna(name) external returns (bool) {
        Luna luna = Luna(payable(address(LunaNameToDetails[name].walletAddress)));

        return luna.executeChangeRecovery(proof, _recoveryHash, email);
    }
}