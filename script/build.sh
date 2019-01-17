#!/bin/bash

set -e

cd ../..
PATH=$(yarn bin):$PATH
cd -
babel -d lib src
