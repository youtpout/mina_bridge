
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

import {Script, console2} from "forge-std/Script.sol";
import {KimchiVerifier} from "../src/Verifier.sol";
import "../lib/VerifierIndex.sol";
import "../lib/deserialize/VerifierIndex.sol";
import "../lib/msgpack/Deserialize.sol";
import "forge-std/console.sol";

contract Serialize is Script {
    VerifierIndex verifier_index;

    function run() public {
        bytes memory verifier_index_serialized = vm.readFileBinary("verifier_index.bin");
        bytes memory linearization_serialized = vm.readFileBinary("linearization.mpk");

        deser_verifier_index(verifier_index_serialized, verifier_index);
        MsgPk.deser_linearization(MsgPk.new_stream(linearization_serialized), verifier_index);

        vm.writeFileBinary("linearization.rlp", abi.encode(verifier_index.linearization));
    }
}
