import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { File, Image, Upload, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FileUploadFieldProps {
  form: UseFormReturn<any>;
  fileType: "imagem" | "arquivo";
  accept?: string;
  activityId?: number;
  initialPreview?: string;
  initialDescription?: string;
}

export function FileUploadField({
  form,
  fileType,
  activityId,
  initialPreview,
  initialDescription
}: FileUploadFieldProps) {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const isImage = fileType === "imagem";
  const fieldName = isImage ? "imagem" : "arquivo";
  const descriptionField = isImage ? "imagemDescricao" : "arquivoDescricao";

  useEffect(() => {
    if (initialPreview) {
      setPreviewUrl(initialPreview);
      const fileName = initialPreview.split('/').pop();
      setFileName(fileName || null);
    }
    if (initialDescription) {
      form.setValue(descriptionField, initialDescription);
    }
  }, [initialPreview, initialDescription]);

  const validateFile = (file: File) => {
    if (isImage) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Formato inválido",
          description: "Por favor, selecione apenas arquivos de imagem.",
        });
        return false;
      }
    } else {
      if (file.type !== 'application/pdf') {
        toast({
          variant: "destructive",
          title: "Formato inválido",
          description: "Por favor, selecione apenas arquivos PDF.",
        });
        return false;
      }
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      e.target.value = '';
      setFileName(null);
      setPreviewUrl(null);
      form.setValue(fieldName, null);
      return;
    }

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
        description: "Ocorreu um erro ao fazer o upload do arquivo.",
      });
    }
  };

  const clearFile = () => {
    setFileName(null);
    setPreviewUrl(null);
    form.setValue(fieldName, null);
    form.setValue(descriptionField, '');
    const input = document.getElementById(fieldName) as HTMLInputElement;
    if (input) input.value = '';
  };

  const hasFile = fileName || previewUrl;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        {isImage ? "Imagem" : "Arquivo PDF"}
      </p>

      <Input
        type="file"
        accept={isImage ? "image/*" : ".pdf"}
        capture={isImage ? "environment" : undefined}
        onChange={handleFileChange}
        className="hidden"
        id={fieldName}
      />

      {hasFile ? (
        <div className="relative group">
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-md border bg-muted/50",
            "text-xs"
          )}>
            {isImage && previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-8 h-8 object-cover rounded"
              />
            ) : (
              <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="truncate flex-1 text-muted-foreground">
              {fileName || "Arquivo selecionado"}
            </span>
            <button
              type="button"
              onClick={clearFile}
              className="p-1 hover:bg-destructive/10 rounded text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <FormField
            control={form.control}
            name={descriptionField}
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormControl>
                  <Input
                    placeholder="Descrição (opcional)"
                    className="h-8 text-xs"
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      ) : (
        <label
          htmlFor={fieldName}
          className={cn(
            "flex flex-col items-center justify-center gap-1 p-3",
            "border border-dashed rounded-md cursor-pointer",
            "hover:border-primary/50 hover:bg-muted/30 transition-colors",
            "text-muted-foreground"
          )}
        >
          {isImage ? (
            <Image className="w-5 h-5" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          <span className="text-xs text-center">
            {isImage ? "Adicionar imagem" : "Adicionar PDF"}
          </span>
        </label>
      )}
    </div>
  );
}
