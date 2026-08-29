export interface ChangeSpecification {
    operation: 'ADD' | 'REMOVE' | 'MODIFY' | 'RENAME' | 'REPLACE';
    target: {
      name: string;
      type: 'component' | 'service' | 'function' | 'config' | 'infrastructure' | 'unknown';
    };
    property?: string;
    replacement?: string;
    contextBoundary?: string;
    changeSemantics: string[];
}

export function parseChangeDescription(description: string): ChangeSpecification {
    const desc = description.trim();
    const lowerDesc = desc.toLowerCase();

    const spec: ChangeSpecification = {
        operation: 'MODIFY',
        target: { name: '', type: 'unknown' },
        changeSemantics: [],
    };

    // Determine Type dynamically later after we extract the target name, unless obvious
    const determineType = (name: string, desc: string) => {
        const lowerName = name.toLowerCase();
        const lowerDesc = desc.toLowerCase();
        
        if (lowerName.includes('redis') || lowerName.includes('kafka') || lowerName.includes('database') || lowerName.includes('publisher')) return 'infrastructure';
        if (lowerName.includes('component') || new RegExp(`${name}\\s+component`, 'i').test(desc)) return 'component';
        if (lowerName.includes('service') || new RegExp(`${name}\\s+service`, 'i').test(desc)) return 'service';
        if (lowerName.includes('helper') || lowerName.includes('function') || lowerName.includes('method') || new RegExp(`${name}\\s+(?:helper|function|method)`, 'i').test(desc)) return 'function';
        if (lowerName.includes('timeout') || lowerName.includes('config') || new RegExp(`${name}\\s+(?:config|client)`, 'i').test(desc)) return 'config';
        
        // Fallback checks on full description if name itself isn't obvious
        if (lowerDesc.includes('component')) return 'component';
        if (lowerDesc.includes('service')) return 'service';
        if (lowerDesc.includes('redis') || lowerDesc.includes('kafka')) return 'infrastructure';
        if (lowerDesc.includes('client') || lowerDesc.includes('api')) return 'config';
        
        return 'unknown';
    };

    // 2. Semantics mapping
    if (lowerDesc.includes('async')) spec.changeSemantics.push('async');
    if (lowerDesc.includes('handler') || lowerDesc.includes('prop')) spec.changeSemantics.push('props', 'handler');
    if (lowerDesc.includes('legacy') || lowerDesc.includes('deprecation')) spec.changeSemantics.push('legacy', 'deprecation');
    if (lowerDesc.includes('event') || lowerDesc.includes('publisher') || lowerDesc.includes('kafka')) spec.changeSemantics.push('event', 'message-broker');
    if (lowerDesc.includes('timeout') || lowerDesc.includes('client') || lowerDesc.includes('network')) spec.changeSemantics.push('network', 'configuration');
    if (lowerDesc.includes('color') || lowerDesc.includes('style') || lowerDesc.includes('css') || lowerDesc.includes('classname')) spec.changeSemantics.push('style', 'visual');
    if (lowerDesc.includes('doc') || lowerDesc.includes('readme') || lowerDesc.includes('documentation')) spec.changeSemantics.push('documentation');

    // 3. Regex Patterns for Operations
    
    // RENAME: "Rename calculateTotal to computeInvoiceTotal" or "Rename the calculateTotal helper to computeInvoiceTotal"
    const renameRegex = /(?:rename|change name of)\s+(?:the\s+)?(?:a\s+)?(?:private\s+)?([\w-]+)(?:\s+(?:helper|function|component|service|module))?\s+to\s+([\w-]+)/i;
    const renameMatch = desc.match(renameRegex);
    if (renameMatch) {
        spec.operation = 'RENAME';
        spec.target.name = renameMatch[1];
        spec.target.type = determineType(spec.target.name, desc);
        spec.replacement = renameMatch[2];
        spec.changeSemantics.push('refactor', 'naming');
        return spec;
    }
    
    const renameTargetOnly = /(?:rename|change name of)\s+(?:a\s+)?(?:private\s+)?(?:the\s+)?([\w-]+)(?:\s+(?:helper|function|component|service|module))?/i;
    const renameMatchOnly = desc.match(renameTargetOnly);
    if (renameMatchOnly && !renameMatch) {
        spec.operation = 'RENAME';
        spec.target.name = renameMatchOnly[1];
        spec.target.type = determineType(spec.target.name, desc);
        spec.changeSemantics.push('refactor', 'naming');
        return spec;
    }

    // REPLACE: "Replace the Redis event publisher in OrderService with Kafka"
    // "Replace Redis with Kafka"
    const replaceRegex = /(?:replace|swap)\s+(?:the\s+)?([\w-]+)(?:.*?)?(?:in\s+([\w-]+)\s+)?with\s+([\w-]+)/i;
    const replaceMatch = desc.match(replaceRegex);
    if (replaceMatch) {
        spec.operation = 'REPLACE';
        spec.target.name = replaceMatch[1];
        spec.target.type = determineType(spec.target.name, desc);
        if (replaceMatch[2] && replaceMatch[2] !== 'with') {
            spec.contextBoundary = replaceMatch[2];
        }
        spec.replacement = replaceMatch[3];
        return spec;
    }

    // REMOVE: "Remove the legacy UserAvatar component"
    const removeRegex = /(?:remove|delete|drop)\s+(?:the\s+)?(?:legacy\s+)?([\w-]+)/i;
    const removeMatch = desc.match(removeRegex);
    if (removeMatch) {
        spec.operation = 'REMOVE';
        spec.target.name = removeMatch[1];
        spec.target.type = determineType(spec.target.name, desc);
        return spec;
    }

    // MODIFY PROPERTY A's B: "Modify the Button component's onClick handler"
    const modifyPropRegex = /(?:modify|change|update)\s+(?:the\s+)?([\w-]+)(?:.*?)'s\s+([\w-]+)/i;
    const modifyPropMatch = desc.match(modifyPropRegex);
    if (modifyPropMatch) {
        spec.operation = 'MODIFY';
        spec.target.name = modifyPropMatch[1];
        spec.target.type = determineType(spec.target.name, desc);
        spec.property = modifyPropMatch[2];
        return spec;
    }

    // MODIFY TYPE/PROP: "Modify the Button component API so that the existing Button component changes the type of its onClick prop."
    // Or "Change the Button onClick type"
    const modifyTypeRegex = /(?:modify|change|update).*?\b([A-Z][a-zA-Z0-9_]+)\b.*?\b([a-zA-Z0-9_]+)\b\s*(?:type|prop|handler)/;
    const modifyTypeMatch = desc.match(modifyTypeRegex);
    if (modifyTypeMatch && modifyTypeMatch[1] !== 'API') {
        spec.operation = 'MODIFY';
        spec.target.name = modifyTypeMatch[1];
        spec.target.type = determineType(spec.target.name, desc);
        spec.property = modifyTypeMatch[2];
        return spec;
    }

    // CONFIG/INCREASE: "Increase the default timeout in the Axios API client to 10 seconds"
    const configRegex = /(?:increase|decrease|change|modify|set)\s+(?:the\s+)?(?:default\s+)?([\w-]+)\s+(?:in|for|on)(?:\s+the)?\s+([\w-]+)\s+(?:api\s+client|service|component)?\s+to\s+(.+)/i;
    const configMatch = desc.match(configRegex);
    if (configMatch) {
        spec.operation = 'MODIFY';
        spec.property = configMatch[1];
        spec.target.name = configMatch[2];
        spec.target.type = determineType(spec.target.name, desc);
        spec.replacement = configMatch[3].replace(/\.$/, '');
        return spec;
    }

    // ADD: "Add authentication middleware to the API"
    const addRegex = /(?:add|insert|create)\s+(?:the\s+)?([\w-]+)(?:.*?)?(?:to|in)\s+([\w-]+)/i;
    const addMatch = desc.match(addRegex);
    if (addMatch) {
        spec.operation = 'ADD';
        spec.target.name = addMatch[1];
        spec.target.type = determineType(spec.target.name, desc);
        spec.contextBoundary = addMatch[2];
        return spec;
    }

    // FALLBACK
    const words = desc.replace(/[^a-zA-Z0-9 -]/g, '').split(' ');
    const stopWords = ['replace', 'change', 'update', 'modify', 'delete', 'remove', 'with', 'component', 'openui', 'the', 'and', 'in', 'to', 'for', 'a', 'an'];
    const targetWord = words.find(w => w.length > 3 && !stopWords.includes(w.toLowerCase())) || words[0];
    
    spec.target.name = targetWord;
    spec.target.type = determineType(spec.target.name, desc);
    return spec;
}
