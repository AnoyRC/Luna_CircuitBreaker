//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract LunaStorage {
    
    struct LunaDetails {
        address walletAddress;
        bool isUsed;
    }

    mapping(string => LunaDetails) public LunaNameToDetails;

    function addLuna(string memory name, address walletAddress) internal {
        LunaNameToDetails[name] = LunaDetails(walletAddress, true);
    }

    function _checkLuna(string memory name) internal view {
        require(LunaNameToDetails[name].isUsed, "Luna: Invalid Luna");
    }
    
    function getLuna(string memory name) external view returns (LunaDetails memory) {
        LunaDetails memory details = LunaNameToDetails[name];
        return details;
    }

    modifier isValidLuna(string memory name) {
        _checkLuna(name);
        _;
    }

}