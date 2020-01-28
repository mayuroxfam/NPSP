import {LightningElement, api, track} from 'lwc';
import GeFormService from 'c/geFormService';
import {handleError} from 'c/utilTemplateBuilder';
import DATA_IMPORT_BATCH_OBJECT from '@salesforce/schema/DataImportBatch__c';

export default class GeGiftEntryFormApp extends LightningElement {
    @api recordId;
    @api sObjectName;

    handleSubmit(event) {
        const table = this.template.querySelector('c-ge-batch-gift-entry-table');

        GeFormService.saveAndDryRun(
            this.recordId, event.detail.data)
            .then(
                dataImportModel => {
                    Object.assign(dataImportModel.dataImportRows[0],
                        dataImportModel.dataImportRows[0].record);
                    table.upsertData(dataImportModel.dataImportRows[0], 'Id');
                    table.setTotalCount(dataImportModel.totalCountOfRows);
                    table.setTotalAmount(dataImportModel.totalAmountOfRows);
                    event.detail.success(); //Re-enable the Save button
                }
            )
            .catch(error => {
                handleError(error);
                event.detail.error();
            });
    }

    handleSectionsRetrieved(event) {
        const formSections = event.target.sections;
        const table = this.template.querySelector('c-ge-batch-gift-entry-table');
        table.handleSectionsRetrieved(formSections);
    }

    handleBatchDryRun() {
        //toggle the spinner on the form
        const form = this.template.querySelector('c-ge-form-renderer');
        const toggleSpinner = function () {
            form.showSpinner = !form.showSpinner
        };
        form.showSpinner = true;

        const table = this.template.querySelector('c-ge-batch-gift-entry-table');
        table.runBatchDryRun(toggleSpinner);
    }

    handleLoadData(event) {
        const form = this.template.querySelector('c-ge-form-renderer');
        form.load(event.detail);
    }

    handleEditBatch() {
        this.dispatchEvent(new CustomEvent('editbatch'));
    }

    get isBatchMode() {
        return this.sObjectName &&
            this.sObjectName === DATA_IMPORT_BATCH_OBJECT.objectApiName;
    }

}