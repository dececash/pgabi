#!/bin/bash

if [ -f "pid" ];then
    kill -9 `cat pid`
    rm -rf pid
fi

echo -n "Enter your key:"
read -s key
echo $key > 0


nohup node bin/pgnode < 0 >> logs/error.log 2>&1 & echo $! > pid & rm -rf 0