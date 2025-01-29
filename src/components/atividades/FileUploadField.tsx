import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { File, Image, Upload } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface FileUploadFieldProps {
  form: UseFormReturn<any>;
  fileType: "imagem" | "arquivo";
  accept?: string;
  activityId?: number;
}

export function FileUploadField({ form, fileType, accept, activityId }: FileUploadFieldProps) {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const isImage = fileType === "imagem";
  const fieldName = isImage ? "imagem" : "arquivo";
  const descriptionField = isImage ? "imagemDescricao" : "arquivoDescricao";
  const label = isImage ? "Upload de Imagem (opcional)" : "Upload de Arquivo (opcional)";
  const placeholder = isImage ? "Descrição da imagem (opcional)" : "Descrição do arquivo (opcional)";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      form.setValue(fieldName, file);
      setFileName(file.name);
      
      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Ocorreu um erro ao fazer o upload do arquivo. Tente novamente.",
      });
    }
  };

  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <div className="mt-2 space-y-2">
        <Input
          type="file"
          accept={accept}
          capture={isImage ? "environment" : undefined}
          onChange={handleFileChange}
          className="hidden"
          id={fieldName}
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <label
            htmlFor={fieldName}
            className="flex-1 flex items-center justify-center h-20 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none relative"
          >
            {isImage && previewUrl ? (
              <div className="relative w-full h-full">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Image className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : fileName ? (
              <div className="flex items-center gap-2">
                {isImage ? (
                  <Image className="w-6 h-6 text-gray-600" />
                ) : (
                  <File className="w-6 h-6 text-gray-600" />
                )}
                <span className="text-sm text-gray-600 truncate max-w-[200px]">
                  {fileName}
                </span>
              </div>
            ) : (
              <span className="flex items-center space-x-2">
                <Upload className="w-6 h-6 text-gray-600" />
                <span className="text-sm text-gray-600">
                  Clique para fazer upload {isImage ? "de imagem" : "de arquivo"}
                </span>
              </span>
            )}
          </label>
        </div>
        
        <FormField
          control={form.control}
          name={descriptionField}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder={placeholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}