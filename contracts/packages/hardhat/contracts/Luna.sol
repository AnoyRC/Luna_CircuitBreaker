//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./callback/TokenCallbackHandler.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./verifier/PasskeyVerifier.sol";
import "./verifier/RecoveryVerifier.sol";

import "./utils/Conversion.sol";

contract Luna is TokenCallbackHandler, Initializable {

    string public DOMAIN;

    bytes public passkeyInputs;

    bytes32 public recoveryHash;
    string public email;

    PasskeyUltraVerifier public immutable PASSKEY_VERIFIER;
    RecoveryUltraVerifier public immutable RECOVERY_VERIFIER;

    mapping(bytes32 => bool) public usedNonces;

    uint256 private nonce;

    constructor(
        address passkeyVerifier_,
        address recoveryVerifier_
    ) {
        PASSKEY_VERIFIER = PasskeyUltraVerifier(passkeyVerifier_);
        RECOVERY_VERIFIER = RecoveryUltraVerifier(recoveryVerifier_);
    }

    function getNonce() public view returns (uint256) {
        return nonce;
    }

    function _useNonce() internal returns (uint256) {
        unchecked {
            return nonce++;
        }
    }

    function initialize(string memory domain ,bytes memory _passkeyInputs, bytes32 _recoveryHash, string memory _email) external initializer {
        _initialize(domain, _passkeyInputs, _recoveryHash, _email);
    }

    function _initialize(string memory domain, bytes memory _passkeyInputs, bytes32 _recoveryHash, string memory _email) internal virtual {
        DOMAIN = domain;
        passkeyInputs = _passkeyInputs;
        recoveryHash = _recoveryHash;
        email = _email;
    }

    function getCredentialId() public view returns (string memory) {
        (, ,string memory credentialId) = Conversion.decodeEncodedInputs(passkeyInputs);
        return credentialId;
    }

    function getPublicKey() public view returns (bytes32, bytes32) {
        (bytes32 pubkeyx, bytes32 pubkeyy, ) = Conversion.decodeEncodedInputs(passkeyInputs);
        return (pubkeyx, pubkeyy);
    }

    function verifyPasskey(bytes calldata proof, bytes32 message) public view returns (bool) {
        (bytes32 pubkeyx, bytes32 pubkeyy, ) = Conversion.decodeEncodedInputs(passkeyInputs);

        bytes32[] memory inputs = Conversion.convertPasskeyInputs(pubkeyx, pubkeyy, message);

        return PASSKEY_VERIFIER.verify(proof, inputs);
    }

    function usePasskey(bytes calldata proof, bytes32 message) internal returns (bool) {
        require(!usedNonces[message], "Nonce already used");
        (bytes32 pubkeyx, bytes32 pubkeyy,) = Conversion.decodeEncodedInputs(passkeyInputs);

        bytes32[] memory inputs = Conversion.convertPasskeyInputs(pubkeyx, pubkeyy, message);

        usedNonces[message] = true;
        return PASSKEY_VERIFIER.verify(proof, inputs);
    }

    function verifyRecovery(bytes calldata proof) public view returns (bool) {
        bytes32 message = Conversion.hashMessage(Strings.toString(getNonce()));

        bytes32[] memory _inputs = Conversion.convertInputs(message, recoveryHash);

        return RECOVERY_VERIFIER.verify(proof, _inputs);
    }

    function useRecovery(bytes calldata proof) internal returns (bool) {
        bytes32 message = Conversion.hashMessage(Strings.toString(_useNonce()));

        bytes32[] memory _inputs = Conversion.convertInputs(message, recoveryHash);

        return RECOVERY_VERIFIER.verify(proof, _inputs);
    }

    function execute(bytes calldata proof, bytes32 message,  address dest, uint256 value, bytes calldata func) external payable returns (bool) {
        require(usePasskey(proof, message), "Invalid passkey");
        _execute(dest, value, func);
        return true;
    }

    function executeBatch(bytes calldata proof, bytes32 message,  address[] calldata dest, uint256[] calldata value, bytes[] calldata func) external payable returns (bool) {
        require(usePasskey(proof, message), "Invalid passkey");
        _executeBatch(dest, value, func);
        return true;
    }

    function executePasskeyRecovery(bytes calldata proof, bytes memory _passkeyInputs) external payable returns (bool) {
        require(useRecovery(proof), "Invalid recovery");
        _changePasskeyInputs(_passkeyInputs);
        return true;
    }

    function executeChangeRecovery(bytes calldata proof, bytes32 _recoveryHash, string memory _email) external payable returns (bool) {
        require(useRecovery(proof), "Invalid recovery");
        _changeRecovery(_recoveryHash, _email);
        return true;
    }

    function _changePasskeyInputs(bytes memory _passkeyInputs) internal  {
		passkeyInputs = _passkeyInputs;
	}

    function _changeRecovery(bytes32 _recoveryHash, string memory _email) internal  {
        recoveryHash = _recoveryHash;
        email = _email;
    }

    function _execute(address dest, uint256 value, bytes calldata func) internal {
        _call(dest, value, func);
    }

    function _executeBatch(address[] calldata dest, uint256[] calldata value, bytes[] calldata func) internal {
        require(dest.length == func.length && (value.length == 0 || value.length == func.length), "wrong array lengths");
        if (value.length == 0) {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], 0, func[i]);
            }
        } else {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], value[i], func[i]);
            }
        }
    }

	function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value : value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    receive() external payable {}

    fallback() external payable {}
}