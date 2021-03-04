/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");

class MyContract2 extends Contract {
    /**
     *
     * addMember
     *
     * When a member to the blockchain - can be either grower, shipper, trader lab or retailer.
     * @param id - the unique id to identify the member
     * @param organization - what organization is the member part of
     * @param address - address of org
     * @param memberType - can be grower, lab, shipper, trader and retailer
     */

    async addMember(ctx, id, organization, address, memberType) {
        console.info("addMember invoked");

        //create object to hold details of our new member
        let newMember = {};

        newMember.id = id;
        newMember.organization = organization;
        newMember.address = address;
        newMember.memberType = memberType;

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(newMember)));
        console.info("updated ledger with key: " + id + "and value: ");
        console.info(JSON.stringify(newMember));

        return newMember;
    }

    async init(ctx) {
        console.info("init invoked");
    }

    /**
     *
     * hempProduct
     *
     * Transaction used to invoke . Will
     * record who poured it, what time, what type of coffee, etc.
     * Users then can use this productID later to get more details from the
     * blockchain about their beverage
     * @param productID - the Id of the cup of coffee to be poured
     */
    async getProduct(ctx, productID, batchId, transactionId) {
        console.info("getProduct called");
        if (productID.length <= 0) {
            throw new Error("Please enter the productID");
        }

        let hempProduct = {};
        hempProduct.productID = productID;

        //there needs to be a batch associated with the product
        let hempAsBytes = await ctx.stub.getState(batchId);
        if (!hempAsBytes || hempAsBytes.length === 0) {
            return new Error(`${batchId} batch does not exist`);
        }

        hempProduct.batchId = batchId;
        hempProduct.transactionId = transactionId;

        console.info("getProduct called after transId");

        //get the first character of the productID - this represents drink type
        let productType = productID.charAt(0);
        if (productType.toLowerCase() === "broad") {
            hempProduct.productType = "Broad-spectrum ";
        } else {
            hempProduct.productType = "Nitro";
        }
        console.info("pourCup called after productType");

        //get the 3nd character of productID - this represents the co-op
        let coop = productID.charAt(1);
        if (coop.toLowerCase() === "b") {
            hempProduct.beanType = "Ethiopian Natural Yirgacheffe";
        }
        console.info("pourCup called after after coop");

        let dateStr = new Date();
        dateStr = dateStr.toString();
        hempProduct.lastPour = dateStr;
        console.info("pourCup called after after date");

        hempProduct.class = "org.ibm.coffee.pourCup";

        console.log("productID");
        console.log(productID);

        await ctx.stub.putState(
            productID,
            Buffer.from(JSON.stringify(hempProduct))
        );
        console.info("updated ledger with key: " + productID + "and value: ");
        console.info(JSON.stringify(hempProduct));
        return hempProduct;
    }

    /**
     * CULTIVATION
     * addBatch
     *
     * When a grower adds a batch of crop during cultivation.
     * This creates hemp asset on the blockchain.
     * @param farmLocation
     * @param seedType
     * @param transplantDate
     * @param yieldQuantity
     * @param batchState - state of coffee (READY_FOR_DISTRIBUTION,
     * REGULATION_TEST_PASSED, IMPORTED, READY_FOR_SALE)
     * @param growerId - the Id of the grower who will be associated with this batch
     */

    // let response = await args.contract.submitTransaction(args.function,
    //   args.size, args.roast, args.batchState, args.grower, args.batchId,
    //    args.transactionId, args.timestamp
    // );
    async addHempBatch(
        ctx,
        farmLocation,
        seedType,
        transplantDate,
        yieldQuantity,
        batchState,
        grower,
        transactionId,
        timestamp
    ) {
        console.info("addHempBatch invoked");

        //TODO:
        //do check to make sure the grower exists in the blockchain

        let hempBatch = {};
        // generate random batchId from Math.random function
        let batchId = Math.random().toString(36).substring(3);
        hempBatch.farmLocation = farmLocation;
        hempBatch.seedType = seedType;
        hempBatch.transplantDate = transplantDate;
        hempBatch.yieldQuantity = yieldQuantity;
        hempBatch.batchState = batchState;
        hempBatch.grower = grower;
        hempBatch.batchId = batchId;
        hempBatch.transactionId = transactionId;
        hempBatch.timestamp = timestamp;

        await ctx.stub.putState(
            batchId,
            Buffer.from(JSON.stringify(hempBatch))
        );
        console.info("updated ledger with key: " + batchId + "and value: ");
        console.info(JSON.stringify(hempBatch));
        return hempBatch;
    }

    /**
     *
     * submitLabResult
     *
     * A transaction which adds lab results to the blockchain
     * @param batchId - the batch of coffee which is produced
     * @param samplingDate
     * @param testId
     * @param strain
     * @param cannabinoidContent
     */

    // args.function,
    // args.reportName, args.organizationDescription, args.reportYear, args.fairtradePremiumInvested,
    // args.invementTitle1, args.investmentAmount2 ,args.investmentTitle2, args.investmentAmount3,
    // args.investmentTitle3, args.batchId, args.transactionId, args.timestamp
    async submitLabResult(
        ctx,
        lab,
        labId,
        samplingDate,
        testId,
        strain,
        cannabinoidContent,
        batchId,
        transactionId,
        timestamp
    ) {
        //get batch identified by batchId from the ledger
        let hempAsBytes = await ctx.stub.getState(batchId);
        if (!hempAsBytes || hempAsBytes.length === 0) {
            return new Error(`${batchId} batch does not exist`);
        }
        let hempBatch = JSON.parse(hempAsBytes);

        //update our batch of hemp with the shipping details and a owner (the trader)
        //let hempBatch = {};

        hempBatch.samplingDate = samplingDate;
        hempBatch.testId = testId;
        hempBatch.labId = labId;
        hempBatch.strain = strain;
        hempBatch.cannabinoidContent = cannabinoidContent;
        hempBatch.batchId = batchId;
        hempBatch.transactionId = transactionId;
        hempBatch.timestamp = timestamp;
        hempBatch.lab = lab;
        console.log("batchId: ");
        console.info(batchId);

        //update the ledger with the new shipping + owner details
        await ctx.stub.putState(
            batchId,
            Buffer.from(JSON.stringify(hempBatch))
        );
        console.info("updated ledger with key: " + batchId + "and value: ");
        console.info(JSON.stringify(hempBatch));
        return hempBatch;
    }

    /**
     *
     * submitPackingList
     *
     * A transaction which adds shipping details from the packing list to the blockchain.
     * @param batchId - the batch we are shipping
     * @param growerId - Id of the grower which handed over hemp to trader
     * @param shipperId - Id of the shipper which handed over hemp to trader
     * @param issueDate - the date the package was shipped
     * @param ICO_Num - ICO_number from the packing list
     * @param ICO_Lot - Lot where the shipment will start the journey from
     * @param FDA_Num - FDA number associated with this batch of hemp
     * @param invoiceNum - packing list invoice number
     * @param billofLadingNum - receipt of freight services
     * @param vesselName - name of the vessel
     * @param vesselVoyageNum number associated with vessel
     * @param containerNum - container which holds our shipment
     * @param sealNum - seal associated with our packing list
     * @param timestamp - when the transaction was submitted to the blockchain
     */

    async submitPackingList(
        ctx,
        grower,
        trader,
        PL_Invoice_no,
        PL_IssueDate,
        PL_ICO_no,
        PL_ICO_Lot,
        PL_FDA_NO,
        PL_Bill_of_Lading_No,
        PL_LoadedVessel,
        PL_VesselVoyage_No,
        PL_Container_No,
        PL_Seal_no,
        PL_timestamp,
        batchId,
        transactionId,
        timestamp
    ) {
        console.info("submit packing list invoked");

        //TODO: do if (batch exists) check

        //get batch identified bby batchId from the ledger
        // let coffeeAsBytes = await ctx.stub.getState(batchId);
        // let batchCoffee = JSON.parse(coffeeAsBytes);
        let hempAsBytes = await ctx.stub.getState(batchId);
        if (!hempAsBytes || hempAsBytes.length === 0) {
            return new Error(`${batchId} batch does not exist`);
        }
        let hempBatch = JSON.parse(hempAsBytes);
        //update our batch of coffee with the shipping details
        hempBatch.grower = grower;
        hempBatch.trader = trader;
        hempBatch.PL_Invoice_no = PL_Invoice_no;
        hempBatch.PL_IssueDate = PL_IssueDate;
        hempBatch.PL_ICO_no = PL_ICO_no;
        hempBatch.PL_ICO_Lot = PL_ICO_Lot;
        hempBatch.PL_FDA_NO = PL_FDA_NO;
        hempBatch.PL_Bill_of_Lading_No = PL_Bill_of_Lading_No;
        hempBatch.PL_LoadedVessel = PL_LoadedVessel;
        hempBatch.PL_VesselVoyage_No = PL_VesselVoyage_No;
        hempBatch.PL_Container_No = PL_Container_No;
        hempBatch.PL_Seal_no = PL_Seal_no;
        hempBatch.PL_timestamp = PL_timestamp;
        hempBatch.batchId = batchId;
        hempBatch.transactionId = transactionId;
        hempBatch.timestamp = timestamp;
        //update the ledger with the new shipping + owner details
        await ctx.stub.putState(
            batchId,
            Buffer.from(JSON.stringify(hempBatch))
        );
        console.info("updated ledger with key: " + batchId + "and value: ");
        console.info(JSON.stringify(hempBatch));
        return hempBatch;
    }

    /**
     * submitWeightTally
     *
     * A transaction which details from the packing list to the blockchain.
     * @param shipperId - Id of the shipper which is now in charge of shipping beans\
     * @param traderId - Id of the trader which is now in charge of shipping beans
     * @param batchId - the batch that is being checked
     * @param dateStripped - date when shipment is inspected
     * @param marks - if the shipment is has visible signs of damage
     * @param bagsExpected - number of bags expected in the shipment
     * @param condition - bad, fair, good, excellent
     * @param insectActivity - yes,no
     *
     */

    async submitWeightTally(
        ctx,
        dateStripped,
        marks,
        bagsExpected,
        condition,
        insectActivity,
        batchId,
        transactionId,
        timestamp
    ) {
        console.info("submit weight tally invoked");
        //TODO: do if (batch exists) check

        //get batch identified bby batchId from the ledger
        // let coffeeAsBytes = await ctx.stub.getState(batchId);
        // let batchCoffee = JSON.parse(coffeeAsBytes);

        let hempAsBytes = await ctx.stub.getState(batchId);
        if (!hempAsBytes || hempAsBytes.length === 0) {
            return new Error(`${batchId} batch does not exist`);
        }
        let hempBatch = JSON.parse(hempAsBytes);
        //update our batch of coffee with the shipping details and a owner (the trader)
        hempBatch.dateStripped = dateStripped;
        hempBatch.marks = marks;
        hempBatch.bagsExpected = bagsExpected;
        hempBatch.condition = condition;
        hempBatch.insectActivity = insectActivity;
        hempBatch.batchId = batchId;
        hempBatch.transactionId = transactionId;
        hempBatch.timestamp = timestamp;

        //update the ledger with the new shipping + owner details
        await ctx.stub.putState(
            batchId,
            Buffer.from(JSON.stringify(hempBatch))
        );
        console.info("updated ledger with key: " + batchId + "and value: ");
        console.info(JSON.stringify(hempBatch));
        return hempBatch;
    }

    async query(ctx, key) {
        console.info("query by key " + key);
        let returnAsBytes = await ctx.stub.getState(key);
        console.info(returnAsBytes);
        if (!returnAsBytes || returnAsBytes.length === 0) {
            return new Error(`${key} does not exist`);
        }
        let result = JSON.parse(returnAsBytes);
        console.info("result of getState: ");
        console.info(result);
        return JSON.stringify(result);
    }

    async deleteKey(ctx, key) {
        console.info("delete key: " + key);
        let returnAsBytes = await ctx.stub.deleteState(key);
        console.info(returnAsBytes);
        if (!returnAsBytes || returnAsBytes.length === 0) {
            console.info("no bytes returned");
            return new Error(`successfully deleted key: ${key}`);
        }
        // let result = JSON.parse(returnAsBytes);
        // console.info('result of deleteState: ');
        // console.info(result);
        return JSON.stringify(returnAsBytes);
    }

    async queryAll(ctx) {
        let queryString = {
            selector: {},
        };

        let queryResults = await this.queryWithQueryString(
            ctx,
            JSON.stringify(queryString)
        );
        return queryResults;
    }

    async queryWithQueryString(ctx, queryString) {
        console.log("query String");
        console.log(JSON.stringify(queryString));

        let resultsIterator = await ctx.stub.getQueryResult(queryString);

        let allResults = [];

        while (true) {
            let res = await resultsIterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};

                console.log(res.value.value.toString("utf8"));

                jsonRes.Key = res.value.key;

                try {
                    jsonRes.Record = JSON.parse(
                        res.value.value.toString("utf8")
                    );
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString("utf8");
                }

                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log("end of data");
                await resultsIterator.close();
                console.info(allResults);
                console.log(JSON.stringify(allResults));
                return JSON.stringify(allResults);
            }
        }
    }
}

module.exports = MyContract2;
