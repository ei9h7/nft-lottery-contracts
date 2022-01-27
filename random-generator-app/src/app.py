import os
import sys
import json
import random
import eth_abi

iexec_out = os.environ["IEXEC_OUT"]

results = [random.randint(int(sys.argv[1]), int(sys.argv[2]))]


# GENERATE CALLBACK
callback_data = eth_abi.encode_abi(["uint256"], [*results]).hex()
callback_data = "0x{}".format(callback_data)
print(
    "Offchain Computing for Smart-Contracts [data:{}, callback_data:{}]".format(
        results, callback_data
    )
)

# Append some results in /iexec_out/
with open(iexec_out + "/result.txt", "w+") as fout:
    fout.write(str(results))

with open(iexec_out + "/computed.json", "w+") as f:
    json.dump({"callback-data": callback_data}, f)
