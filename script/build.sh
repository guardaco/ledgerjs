#!/bin/bash

set -e

cd ../..
PATH=$(yarn bin):$PATH
cd -
npm install
babel -d lib src
