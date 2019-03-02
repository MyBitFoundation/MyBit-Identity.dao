pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";

contract Identity is AragonApp {
    /// Events
    event NewRequest(address indexed user, uint256 indexed requestID, string ipfs);
    event Authorized(address indexed user, uint256 indexed requestID);

    /// Values
    struct Request {
      uint256 requestID;
      string ipfs;
    }
    mapping (address => Request) requests;
    mapping (address => bool) whitelist;
    uint256 currentRequest;

    /// ACL
    bytes32 constant public AUTHORIZE_ROLE = keccak256("AUTHORIZE_ROLE");

    function initialize(/*address[] _whitelist*/) onlyInit public {
      initialized();
      currentRequest = 1;
      /*
      for(uint8 i=0; i<_whitelist.length; i++){
        whitelist[_whitelist[i]] = true;
      }
      */
    }

    /**
     * @notice Submit supporting evidence that you are a real person. This will take two transactions. First, to submit the proof, then to submit the request.
     * @param _ipfs The ipfs address where supporting evidence is located
     */
    function submitProof(string _ipfs) external returns (uint256){
      require(!whitelist[msg.sender]);
      requests[msg.sender] = Request({
        requestID: currentRequest,
        ipfs: _ipfs
      });
      currentRequest += 1;
      emit NewRequest(msg.sender, requests[msg.sender].requestID, _ipfs);
      return requests[msg.sender].requestID;
    }


    /**
     * @notice Request approval from the DAO
     * @param _user Ethereum address of the user
     */
    function requestAuthorization(address _user) external auth(AUTHORIZE_ROLE) returns (bool){
      require(requests[_user].requestID != 0);
      whitelist[_user] = true;
      emit Authorized(_user, requests[_user].requestID);
      return true;
    }
}
