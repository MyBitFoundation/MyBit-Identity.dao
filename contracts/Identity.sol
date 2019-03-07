pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

contract Identity is AragonApp {
    /// Events
    event NewSubmission(address indexed user, string ipfs);
    event Authorized(address indexed user);

    /// Values
    address public token;
    address public voting;
    mapping (address => string) public ipfs;
    mapping (address => bool) public whitelist;

    /// ACL
    bytes32 constant public AUTHORIZE_ROLE = keccak256("AUTHORIZE_ROLE");

    function initialize(address _token, address _voting, address[] _whitelist) onlyInit public {
      initialized();
      token = _token;
      voting = _voting;
      for(uint8 i=0; i<_whitelist.length; i++){
        whitelist[_whitelist[i]] = true;
      }
    }

    /**
     * @notice Submit supporting evidence that you are a real person.
     * @param _ipfs The ipfs address where supporting evidence is located
     */
    function submitProof(string _ipfs) external returns (bool){
      require(!whitelist[msg.sender]);
      ipfs[msg.sender] = _ipfs;
      emit NewSubmission(msg.sender, _ipfs);
      return true;
    }


    /**
     * @notice Request approval for `_user`
     * @param _user Ethereum address of the user
     */
    function requestAuthorization(address _user)
    external
    auth(AUTHORIZE_ROLE)
    returns (bool){
      require(bytes(ipfs[_user]).length != 0);
      whitelist[_user] = true;
      emit Authorized(_user);
      return true;
    }

    /**
     * @notice Revoke approval for `_user`
     * @param _user Ethereum address of the user
     */
    function revokeAuthorization(address _user)
    external
    auth(AUTHORIZE_ROLE)
    returns (bool){
      whitelist[_user] = false;
      return true;
    }

    function checkWhitelist(address _user)
    external
    returns (bool){
      return whitelist[_user];
    }
}
