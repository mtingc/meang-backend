import { Db } from "mongodb";
import { IVariables } from "../interfaces/variables.interface";
import { pagination } from "../lib/pagination";
import { IContextData } from "./../interfaces/context-data.interface";
import { 
    findElements, 
    findOneElement, 
    insertOneElement, 
    updateOneElement, 
    deleteOneElement 
} from "./../lib/db-operations";

class ResolversOperationsService {

    private root: object;
    private variables: IVariables;
    private context: IContextData;

    constructor(root: object, variables: object, context: IContextData) {
        this.root = root;
        this.variables = variables;
        this.context = context;
    }

    protected getContext(): IContextData { return this.context; }
    protected getDb(): Db { return this.context.db!; }
    protected getVariables(): IVariables { return this.variables; }

    // List info
    protected async list(collection: string, listElement: string, page: number = 1, itemsPage: number = 20) {
        try {
            const paginationData = await pagination(this.getDb(), collection, page, itemsPage);
            return {
                info: {
                    page: paginationData.page,
                    pages: paginationData.pages,
                    itemsPage: paginationData.itemsPage,
                    total: paginationData.total
                },
                status: true,
                message: `Lista de ${ listElement } correctamente cargada`,
                items: await findElements(this.getDb(), collection, {}, paginationData),
            };
        } catch (error) {
            return {
                info: null,
                status: false,
                message: `Lista de ${ listElement } no cargada: ${ error }`,
                items: null
            };
        }
    }

    // Get item details
    protected async get(collection: string) {
        const collectionLabel = collection.toLowerCase();
        try {
            return await findOneElement(this.getDb(), collection, { id: this.variables.id }).then(
                result => {
                    if (result) {
                        return {
                            status: true,
                            message: `${ collectionLabel } ha sido cargada con sus detalles`,
                            item: result
                        };
                    }
                    return {
                        status: true,
                        message: `${ collectionLabel } no ha obtenido detalles por que no existe`,
                        item: null
                    };
                }
            );
        } catch (error) {
            return {
                status: false,
                message: `Error al cargar los detalles de ${ collectionLabel }`,
                item: null
            };
        }
    }

    // Add item
    protected async add(collection: string, document: object, item: string) {
        try {
            return await insertOneElement(this.getDb(), collection, document).then(
                res => {
                    if (res.result.ok === 1) {
                        return {
                            status: true,
                            message: `Añadido correctamente el ${ item }.`,
                            item: document
                        };
                    }
                    return {
                        status: false,
                        message: `No se ha insertado el ${ item }. Intentalo de nuevo.`,
                        item: null
                    };
                }
            );
        } catch (error) {
            return {
                status: false,
                message: `Error inesperado al insertar el ${ item }. Intentalo de nuevo.`,
                item: null
            };
        }
    }

    // Modify item
    protected async update(collection: string, filter: object, objectUpdate: object, item: string) {
        try {
            return await updateOneElement(
                this.getDb(),
                collection,
                filter,
                objectUpdate
            ).then(
                res => {
                    if (res.result.nModified === 1 && res.result.ok) {
                        return {
                            status: true,
                            message: `Elemento del ${ item } actualizado correctamente.`,
                            item: Object.assign({}, filter, objectUpdate)
                        };
                    }
                    return {
                        status: false,
                        message: `Elemento del ${ item } no se ha actualizado. Comprueba que estas filtrando correctamente o no hay algo que actualizar`,
                        item: null
                    };
                }
            );
        } catch (error) {
            return {
                status: false,
                message: `Error al actualizar ${ item }. Intentalo de nuevo`,
                item: null
            };
        }
    }

    // Delete item
    protected async del(collection: string, filter: object, item: string) {
        try {
            return await deleteOneElement(this.getDb(), collection, filter).then(
                (res) => {
                    if (res.deletedCount === 1) {
                        return {
                            status: true,
                            message: `Elemento del ${ item } borrado correctamente.`
                        };
                    }
                    return {
                        status: false,
                        message: `Elemento del ${ item } no se ha borrado. Comprueba el filtro.`
                    };
                }
            )
        } catch (error) {
            return {
                status: false,
                message: `Error inesperado al eliminar el ${ item }.`
            };
        }
    }
}

export default ResolversOperationsService;