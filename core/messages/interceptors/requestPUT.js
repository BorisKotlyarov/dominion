const Message               = use('core/messages');
const Errors                = use('core/errors');


Message.request.addInterceptor(requestPUTAnalyzer);

function requestPUTAnalyzer() {
    return Promise.resolve().then((body) => {
        if (this.request.method === "PUT" && this.request.body.hasOwnProperty('id')){
            throw new Errors.BadRequest("PUT request shall not contain object's 'id' property.");
        }
        return body;
    });
}